var {spawn}  = require('node:child_process');

const pythonShell = spawn('py pyScript.py', ['ama', 1, 'kofi', 2], {shell: true});

pythonShell.stdout.on('data', (data)=>{
    console.log('data from python', data.toString());
});

pythonShell.stderr.on('error', (error)=>{
    console.log("error from python", error);
})