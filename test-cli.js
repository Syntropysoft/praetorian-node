const { spawn } = require('child_process');

console.log('Testing CLI...');

const child = spawn('npx', ['tsx', 'src/cli/simple-cli.ts', '--help'], {
  stdio: 'pipe'
});

child.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

child.on('close', (code) => {
  console.log('Exit code:', code);
}); 