import {parentPort,workerData}from'node:worker_threads';import {generate,db}from'./engine.mjs';
try{let report=await generate(workerData.type,m=>parentPort.postMessage({progress:m}));parentPort.postMessage({done:true,id:report.id});}catch(e){parentPort.postMessage({error:e.stack??e.message});process.exitCode=1;}finally{db.close();}
