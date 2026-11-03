// A controller owns one state and one scene. Two players never share mutable state.
RL.geometry={left:6,top:15,width:88};
RL.geometry.bottom=RL.geometry.top+RL.geometry.width*1.25/(RL.body.viewport[2]/RL.body.viewport[3]);
RL.createAssembly=function({state,scene,onChange=()=>{},onSelection=()=>{},message=()=>{},isUnlocked=()=>true,limit=5,prefix='piece',canMutate=()=>true}){
  const getState=typeof state==='function'?state:()=>state,getScene=typeof scene==='function'?scene:()=>scene;
  let serial=Math.max(0,...(getState()?.placed||[]).filter(p=>p.uid.startsWith(prefix+'-')).map(p=>Number(p.uid.slice(prefix.length+1))||0));
  const api={
    save(){const s=getState();s.history.push(JSON.stringify({placed:s.placed,layers:s.layers}));if(s.history.length>60)s.history.shift()},
    syncLayers(){const s=getState(),body=s.layers.indexOf('body');s.placed.forEach(p=>p.layer=s.layers.indexOf(p.uid)<body?'back':'front')},
    height(p){const item=RL.itemBy(p.id);return p.size*1.25/(item.viewport[2]/item.viewport[3])},
    keepVisible(p){const h=this.height(p);p.x=Math.max(0,Math.min(100-p.size,p.x));p.y=Math.max(0,Math.min(100-h,p.y));if(RL.itemBy(p.id).category==='patitas'&&p.layer==='back')p.y=Math.max(p.y,Math.min(100-h,RL.geometry.bottom-h*.65))},
    notify(){this.draw();onChange()},
    equip(id){
      const s=getState(),item=RL.itemBy(id);if(!item||s.done||!canMutate())return;
      if(!isUnlocked(item)){message('Resuelve el reto para desbloquear la pieza.');return}
      const copies=s.placed.filter(p=>p.id===id).length;
      if(copies>=limit){message('Ya tienes '+limit+' copias de esta pieza.');RL.beep(false);return}
      this.save();const cat=item.category;
      const sizes={ojos:13,bocas:15,sonrojos:15,accesorios:item.kind==='sombreros'?46:39,patitas:16,botones:12};
      const positions={ojos:[61,45],bocas:[70,64],sonrojos:[59,63],accesorios:[51,15],patitas:[18,77],botones:[19,32]};
      let [x,y]=positions[cat];const count=s.placed.filter(p=>RL.itemBy(p.id).category===cat).length;
      if(cat==='ojos'||cat==='sonrojos')x=count%2?79:60;
      if(cat==='patitas')x=[17,35,55,74,8][count%5];
      if(cat==='botones')[x,y]=[[19,31],[36,20],[27,41],[46,30],[12,45]][count%5];
      const p={id,uid:prefix+'-'+(++serial),x:x+(copies%8)*.8,y:y+(copies%8)*.8,size:sizes[cat],angle:0,layer:cat==='patitas'?'back':'front'};
      if(cat==='patitas')p.y=RL.geometry.bottom-this.height(p)*.6+(copies%2)*.8;
      s.placed.push(p);if(cat==='patitas')s.layers.splice(s.layers.indexOf('body'),0,p.uid);else s.layers.push(p.uid);
      this.syncLayers();this.keepVisible(p);s.selected=p.uid;this.notify();
    },
    select(uid){const s=getState();if(s.done||!canMutate())return;s.selected=uid;this.draw();onSelection()},
    remove(){const s=getState();if(!s.selected||s.done||!canMutate())return;this.save();s.placed=s.placed.filter(p=>p.uid!==s.selected);s.layers=s.layers.filter(uid=>uid!==s.selected);s.selected=null;this.notify()},
    tool(action){
      const s=getState();if(s.done||!canMutate())return;
      if(action==='undo'){if(s.history.length){const old=JSON.parse(s.history.pop());s.placed=old.placed;s.layers=old.layers;s.selected=null;this.syncLayers();this.notify()}return}
      if(action==='reset'){if(s.placed.length){this.save();s.placed=[];s.layers=['body'];s.selected=null;this.notify()}return}
      const p=s.placed.find(p=>p.uid===s.selected);if(!p){message('Selecciona una copia para editarla.');return}
      if(action==='front'||action==='back'){const i=s.layers.indexOf(p.uid),j=i+(action==='front'?1:-1);if(j<0||j>=s.layers.length)return;this.save();[s.layers[i],s.layers[j]]=[s.layers[j],s.layers[i]];this.syncLayers()}
      else{this.save();if(action==='rotate')p.angle+=15;if(action==='left')p.angle-=15;if(action==='plus')p.size=Math.min(65,p.size+2);if(action==='minus')p.size=Math.max(5,p.size-2)}
      this.keepVisible(p);this.notify();
    },
    moveSelected(dx,dy){const s=getState(),p=s.placed.find(p=>p.uid===s.selected);if(!p||s.done||!canMutate())return;this.save();p.x+=dx;p.y+=dy;this.keepVisible(p);this.notify()},
    draw(){
      const s=getState(),root=getScene();if(!root)return;
      const existing=new Map([...root.querySelectorAll('.placed')].map(el=>[el.dataset.uid,el]));
      const ids=new Set(s.placed.map(p=>p.uid));
      existing.forEach((el,uid)=>{if(!ids.has(uid))el.remove()});
      const body=root.querySelector('.base-piece');if(body)body.style.zIndex=20+s.layers.indexOf('body');
      s.placed.forEach(p=>{
        const item=RL.itemBy(p.id),uid=p.uid;
        let el=existing.get(uid),fresh=!el;
        if(fresh){el=document.createElement('div');el.dataset.uid=uid;el.innerHTML=RL.sprite(p.id);root.appendChild(el)}
        el.className='placed'+(s.selected===uid?' active':'');el.dataset.layer=p.layer;
        el.style.cssText=`left:${p.x}%;top:${p.y}%;width:${p.size}%;height:${api.height(p)}%;transform:rotate(${p.angle}deg);z-index:${20+s.layers.indexOf(uid)}`;
        el.setAttribute('aria-label',item.name);
        if(!fresh)return;
        // Keep this element during unrelated redraws, preserving pointer capture.
        let drag=null,pointer=null;
        el.addEventListener('pointerdown',ev=>{
          const state=getState(),piece=state.placed.find(p=>p.uid===uid);
          if((ev.pointerType==='mouse'&&ev.button!==0)||state.done||pointer!==null||!piece||!canMutate()||!el.isConnected)return;
          ev.preventDefault();pointer=ev.pointerId;state.selected=uid;api.save();
          drag={cx:ev.clientX,cy:ev.clientY,x:piece.x,y:piece.y};el.setPointerCapture(ev.pointerId);
          root.querySelectorAll('.placed').forEach(node=>node.classList.remove('active'));el.classList.add('active');onSelection();
        });
        el.addEventListener('pointermove',ev=>{
          if(!drag||ev.pointerId!==pointer||!canMutate())return;
          const piece=getState().placed.find(p=>p.uid===uid);if(!piece)return;
          ev.preventDefault();const box=root.getBoundingClientRect();
          piece.x=drag.x+(ev.clientX-drag.cx)*100/box.width;piece.y=drag.y+(ev.clientY-drag.cy)*100/box.height;
          api.keepVisible(piece);el.style.left=piece.x+'%';el.style.top=piece.y+'%';
        });
        const stop=ev=>{
          if(!drag||ev.pointerId!==pointer)return;
          const ended=pointer;drag=null;pointer=null;
          if(el.hasPointerCapture(ended))el.releasePointerCapture(ended);onSelection();
        };
        ['pointerup','pointercancel','lostpointercapture'].forEach(type=>el.addEventListener(type,stop));
      });
    }

  };return api;
};
RL.assembly=RL.createAssembly({state:()=>RL.state,scene:()=>document.querySelector('#robot-scene'),onChange:()=>RL.onAssemblyChanged?.(),onSelection:()=>RL.onSelectionChanged?.(),message:text=>RL.message?.(text),isUnlocked:item=>RL.isUnlocked?.(item)});
RL.drawBoard=()=>RL.assembly.draw();
