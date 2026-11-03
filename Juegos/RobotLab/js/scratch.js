// Blank scratchpad: the operation is presented outside the drawing surface.
RL.scratch={
  mount(root,challenge,{compact=false,canDraw=()=>true}={}){
    challenge.drawing||=[];challenge.drawingHistory||=[];
    root.classList.add('scratch-widget');root.classList.toggle('compact-scratch',compact);
    root.innerHTML=`<div class="scratch-tools" role="group" aria-label="Herramientas de pizarra"><button class="pen-color is-active" data-pen="#e5eaff" aria-label="Tiza clara" aria-pressed="true" style="--pen:#e5eaff"></button><button class="pen-color" data-pen="#65daff" aria-label="Tiza azul" aria-pressed="false" style="--pen:#65daff"></button><button class="pen-color" data-pen="#ff91c8" aria-label="Tiza rosa" aria-pressed="false" style="--pen:#ff91c8"></button><button class="btn alt" data-scratch="erase" aria-label="Goma" aria-pressed="false">${RL.icon('remove')}<span>Goma</span></button><button class="btn alt" data-scratch="undo" aria-label="Deshacer trazo">${RL.icon('undo')}<span>Deshacer</span></button><button class="btn alt" data-scratch="clear" aria-label="Limpiar pizarra">${RL.icon('reset')}<span>Limpiar</span></button></div><div class="scratch-surface"><canvas class="drawing-canvas" width="1200" height="800" aria-label="Pizarra libre para resolver ${challenge.question.q}."></canvas></div>`;
    const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');let color='#e5eaff',erase=false;const active=new Map();
    const draw=()=>{ctx.clearRect(0,0,1200,800);ctx.lineCap='round';ctx.lineJoin='round';for(const stroke of challenge.drawing){ctx.globalCompositeOperation=stroke.erase?'destination-out':'source-over';ctx.strokeStyle=ctx.fillStyle=stroke.color;ctx.lineWidth=stroke.width;if(stroke.points.length===1){const [x,y]=stroke.points[0];ctx.beginPath();ctx.arc(x*1200,y*800,stroke.width/2,0,Math.PI*2);ctx.fill()}else{ctx.beginPath();stroke.points.forEach(([x,y],i)=>i?ctx.lineTo(x*1200,y*800):ctx.moveTo(x*1200,y*800));ctx.stroke()}}ctx.globalCompositeOperation='source-over'};
    const save=()=>{challenge.drawingHistory.push(JSON.stringify(challenge.drawing));if(challenge.drawingHistory.length>30)challenge.drawingHistory.shift()};
    const point=e=>{const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))]};
    const release=pointerId=>{if(canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId)};
    const stopAll=()=>{const ids=[...active.keys()];active.clear();ids.forEach(release)};
    canvas.addEventListener('pointerdown',e=>{
      if((e.pointerType==='mouse'&&e.button!==0)||active.has(e.pointerId)||!canDraw())return;
      e.preventDefault();if(!active.size)save();
      const stroke={color,erase,width:erase?40:7,points:[point(e)]};
      active.set(e.pointerId,stroke);challenge.drawing.push(stroke);canvas.setPointerCapture(e.pointerId);draw();
    });
    canvas.addEventListener('pointermove',e=>{
      const stroke=active.get(e.pointerId);if(!stroke||!canDraw())return;
      e.preventDefault();stroke.points.push(point(e));draw();
    });
    const stop=e=>{if(!active.has(e.pointerId))return;active.delete(e.pointerId);release(e.pointerId)};
    ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,stop));
    const tools=()=>{root.querySelectorAll('[data-pen]').forEach(el=>{const on=!erase&&el.dataset.pen===color;el.classList.toggle('is-active',on);el.setAttribute('aria-pressed',String(on))});root.querySelector('[data-scratch="erase"]').setAttribute('aria-pressed',String(erase));canvas.classList.toggle('erasing',erase)};
    root.querySelectorAll('[data-pen]').forEach(el=>el.onclick=()=>{if(!canDraw())return;color=el.dataset.pen;erase=false;tools()});
    root.querySelector('[data-scratch="erase"]').onclick=()=>{if(!canDraw())return;erase=!erase;tools()};
    root.querySelector('[data-scratch="undo"]').onclick=()=>{if(!canDraw())return;stopAll();if(challenge.drawingHistory.length){challenge.drawing=JSON.parse(challenge.drawingHistory.pop());draw()}};
    root.querySelector('[data-scratch="clear"]').onclick=()=>{if(!canDraw())return;stopAll();if(challenge.drawing.length){save();challenge.drawing=[];draw()}};draw();return {draw};
  }
};
