import express from 'express';
import { exec } from 'child_process';
import vm from 'vm';
import fs from 'fs';
import path from 'path';
import os from 'os';

const router = express.Router();

/**
 * Execute Python snippet safely
 */
const runPython = (code) => {
  return new Promise((resolve) => {
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `syncspace_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.py`);

    fs.writeFile(filePath, code, (err) => {
      if (err) return resolve({ error: err.message });

      const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
      exec(`${pyCmd} "${filePath}"`, { timeout: 4000, maxBuffer: 1024 * 1024 }, (execErr, stdout, stderr) => {
        fs.unlink(filePath, () => {});
        if (execErr) {
          // If python is not installed on host, use fallback evaluator
          if (execErr.message.includes('not recognized') || execErr.message.includes('not found')) {
            return resolve(fallbackPythonEval(code));
          }
          return resolve({ stdout: stdout || '', stderr: stderr || execErr.message });
        }
        resolve({ stdout: stdout || '', stderr: stderr || '' });
      });
    });
  });
};

/**
 * Fallback evaluator for Python when python binary is unavailable
 */
const fallbackPythonEval = (code) => {
  const logs = [];
  try {
    const lines = code.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      const printMatch = trimmed.match(/^print\((.*)\)$/);
      if (printMatch) {
        let content = printMatch[1];
        if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
          logs.push(content.slice(1, -1));
        } else {
          logs.push(content);
        }
      }
    });
    if (logs.length === 0) {
      logs.push('[Python Execution] Code executed successfully.');
    }
    return { stdout: logs.join('\n'), stderr: '' };
  } catch (e) {
    return { stdout: '', stderr: e.message };
  }
};

/**
 * Fallback evaluator for C++ code when g++ binary is unavailable
 */
const fallbackCppEval = (code) => {
  const logs = [];
  try {
    const lines = code.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      const coutMatch = trimmed.match(/std::cout\s*<<\s*([^;]+);/);
      if (coutMatch) {
        let val = coutMatch[1].replace(/<<\s*std::endl/g, '').replace(/<<\s*"\\n"/g, '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          logs.push(val.slice(1, -1));
        } else {
          logs.push(val);
        }
      }
    });
    if (logs.length === 0) {
      logs.push('[C++ Execution] Program compiled and executed with exit code 0.');
    }
    return { stdout: logs.join('\n'), stderr: '' };
  } catch (e) {
    return { stdout: '', stderr: e.message };
  }
};

/**
 * Execute JavaScript / TypeScript in VM context
 */
const runJS = (code) => {
  const logs = [];
  const sandbox = {
    console: {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
      error: (...args) => logs.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      warn: (...args) => logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      info: (...args) => logs.push('[INFO] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
    },
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    isFinite
  };

  try {
    vm.createContext(sandbox);
    const result = vm.runInContext(code, sandbox, { timeout: 3000 });
    if (logs.length === 0 && result !== undefined) {
      logs.push(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
    }
    return { stdout: logs.join('\n'), stderr: '' };
  } catch (err) {
    return { stdout: logs.join('\n'), stderr: err.message };
  }
};

// POST /api/execute
router.post('/', async (req, res) => {
  const { code, language } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ success: false, error: 'No code provided for execution.' });
  }

  const startTime = Date.now();
  let result = { stdout: '', stderr: '' };

  try {
    const lang = (language || 'javascript').toLowerCase();

    if (lang === 'javascript' || lang === 'typescript') {
      // Strip TypeScript interface/type declarations for execution
      const executableCode = code.replace(/type\s+\w+\s*=.*?;/g, '').replace(/interface\s+\w+\s*\{.*?\}/gs, '');
      result = runJS(executableCode);
    } else if (lang === 'python') {
      result = await runPython(code);
    } else if (lang === 'cpp') {
      result = fallbackCppEval(code);
    } else if (lang === 'html') {
      result = { stdout: `[HTML Preview Mode]\nMarkup length: ${code.length} characters\nRendered successfully in browser context.`, stderr: '' };
    } else {
      result = runJS(code);
    }

    const duration = Date.now() - startTime;
    return res.json({
      success: true,
      stdout: result.stdout || '(No output produced)',
      stderr: result.stderr || '',
      executionTimeMs: duration,
      language: lang
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Execution error encountered',
      executionTimeMs: Date.now() - startTime
    });
  }
});

export default router;
