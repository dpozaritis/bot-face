import React, {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {expressions,initialState,command,validState} from './protocol';
import './style.css';

function App(){
 const [state,setState]=useState(()=>{try{const s=JSON.parse(localStorage.getItem('robot-face'));return validState(s)?s:initialState}catch{return initialState}});
 const [faceOnly,setFaceOnly]=useState(false),[demo,setDemo]=useState(false),[blink,setBlink]=useState(false);
 const [url,setUrl]=useState(''),[status,setStatus]=useState('Local preview'),[log,setLog]=useState(''),[error,setError]=useState('');
 const socket=useRef(null),live=useRef(state); live.current=state;
 function patch(change){setDemo(false);setState(s=>({...s,...change}));}
 useEffect(()=>{try{localStorage.setItem('robot-face',JSON.stringify(state))}catch{}},[state]);
 useEffect(()=>{if(!state.autoBlink)return;let end;const id=setInterval(()=>{setBlink(true);end=setTimeout(()=>setBlink(false),150)},4200);return()=>{clearInterval(id);clearTimeout(end);setBlink(false)}},[state.autoBlink]);
 useEffect(()=>{if(!demo)return;const id=setInterval(()=>setState(s=>({...s,expression:expressions[(expressions.indexOf(s.expression)+1)%expressions.length]})),2200);return()=>clearInterval(id)},[demo]);
 useEffect(()=>()=>socket.current?.close(),[]);
 useEffect(()=>{if(socket.current?.readyState===WebSocket.OPEN){const msg=JSON.stringify(command(state));socket.current.send(msg);setLog(msg)}},[state]);
 function disconnect(){const ws=socket.current;socket.current=null;ws?.close();setStatus('Local preview')}
 function connect(){
  setError('');let target;try{target=new URL(url);if(!['ws:','wss:'].includes(target.protocol))throw Error();}catch{setError('Enter a valid ws:// or wss:// backend address.');return;}
  if(location.protocol==='https:' && target.protocol!=='wss:'){setError('This HTTPS page needs a secure wss:// backend.');return;}
  disconnect();setStatus('Connecting');const ws=new WebSocket(target);socket.current=ws;
  ws.onopen=()=>{if(socket.current!==ws)return;setStatus('Connected');const msg=JSON.stringify(command(live.current));ws.send(msg);setLog(msg)};
  ws.onclose=()=>{if(socket.current===ws){socket.current=null;setStatus('Disconnected')}};
  ws.onerror=()=>{if(socket.current===ws)setError('Connection failed. Check the backend address, certificate, and network.')};
  ws.onmessage=e=>{if(socket.current!==ws)return;try{const msg=JSON.parse(e.data);if(msg.version===1&&msg.type==='face.state'&&validState(msg.state)){setDemo(false);setState(msg.state)}}catch{}};
 }
 async function copy(){try{await navigator.clipboard.writeText(JSON.stringify(command(state),null,2));setError('Command copied.')}catch{setError('Clipboard unavailable. Copy the command from the panel below.')}}
 return <main className={faceOnly?'face-only':''}>
  <header><div><p className="eyebrow">PERSONAL ROBOT / V0.1</p><h1>A little more alive.</h1><p className="muted">Expression studio · Mac & iPhone</p></div><span className="badge">● {status}</span></header>
  <section className="workspace">
   <div className="display"><div className="display-top"><span>FACE PREVIEW</span><span>{state.expression}</span></div>
    <div className={'face '+state.expression+(blink?' blink':'')+(state.speaking?' speaking':'')} style={{'--face-color':state.color,opacity:state.brightness}}>
     <div className="eyes" style={{transform:`translate(${state.gazeX*24}px,${state.gazeY*18}px)`}}><i className="eye left"/><i className="eye right"/></div><div className="mouth"/>
    </div>
    <div className="display-bottom"><span>{state.speaking?'Speaking animation':'Ready to connect'}</span><button onClick={()=>setFaceOnly(!faceOnly)}>{faceOnly?'Show controls':'Face only ↗'}</button></div>
   </div>
   <aside><div className="section-title"><h2>Personality</h2><button aria-pressed={demo} onClick={()=>setDemo(!demo)}>{demo?'Stop demo':'Play demo'}</button></div>
    <div className="expressions">{expressions.map(e=><button key={e} aria-pressed={state.expression===e} className={state.expression===e?'selected':''} onClick={()=>patch({expression:e})}>{e}</button>)}</div>
    <h2>Fine tuning</h2><label>Look left / right<input type="range" min="-1" max="1" step="0.05" value={state.gazeX} onChange={e=>patch({gazeX:+e.target.value})}/></label><label>Look up / down<input type="range" min="-1" max="1" step="0.05" value={state.gazeY} onChange={e=>patch({gazeY:+e.target.value})}/></label><label>Brightness<input type="range" min="0.2" max="1" step="0.05" value={state.brightness} onChange={e=>patch({brightness:+e.target.value})}/></label>
    <div className="row"><label>Eye color <input type="color" value={state.color} onChange={e=>patch({color:e.target.value})}/></label><button onClick={()=>patch(initialState)}>Reset</button></div>
    <div className="toggles"><label><input type="checkbox" checked={state.autoBlink} onChange={e=>patch({autoBlink:e.target.checked})}/>Auto blink</label><label><input type="checkbox" checked={state.speaking} onChange={e=>patch({speaking:e.target.checked})}/>Speaking</label></div>
   </aside>
  </section>
  <section className="connection"><div><p className="eyebrow">FUTURE HARDWARE BRIDGE</p><h2>One face. Multiple bodies.</h2><p className="muted">Local controls work now. Connect a compatible backend later to send versioned face commands.</p></div><label>Backend WebSocket URL<input type="url" placeholder="wss://your-backend.example/ws" value={url} onChange={e=>setUrl(e.target.value)}/></label><div className="row"><button onClick={connect}>Connect</button><button onClick={disconnect}>Disconnect</button><button onClick={copy}>Copy command</button></div><p role="status">{error}</p><details><summary>Command protocol & latest transmission</summary><pre>{JSON.stringify(command(state),null,2)}</pre><p className="muted">{log?'A command was sent. This is not a hardware acknowledgement.':'No command sent. This is a local preview.'}</p></details></section>
  <footer>Designed for your phone today. A robot tomorrow.</footer>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);
