// Inlined by build-sketch.py into each instance; driven only by its existing RAF.
function cancelAll(){
  if(allPlayback)playing=false;
  allPlayback=false;allFinished=false;syncAll();
}
function syncAll(){
  wrap.dataset.allPlayback=String(allPlayback);wrap.dataset.allFinished=String(allFinished);
  for(const b of allButtons){b.setAttribute('aria-pressed',String(allPlayback));b.classList.toggle('on',allPlayback);}
  allStatus.textContent=allFinished?'全部步骤已播放。':allPlayback?(playing?'正在按顺序播放全部步骤。':'全部步骤已暂停；点继续可接着播放。'):'';
}
function startAll(){
  if(!steps.length)return;
  allPlayback=true;allFinished=false;playing=true;u=uAbs=steps[0].from;
  expl=expT=0;viewHold=false;camGoal=null;focusGoal=null;lastViewKey='';lastStep=-2;pinned=null;
  if(pbs.length){mode='buttons';done.clear();curSeg=pbs[0];}
  syncButtons();
}
function advanceAll(dt){
  if(!allPlayback||!playing)return;
  const previous=pbs.length?curSeg:null;
  uAbs=Math.min(.9999,uAbs+(dt*SPEEDS[speedIx])/cycle);u=uAbs;
  if(pbs.length){
    for(const b of pbs)if(u>=b.to)done.add(b.id);
    curSeg=pbs.find(b=>u>=b.from&&u<b.to)||null;
  }
  if(uAbs>=.9999){
    u=uAbs=.9999;playing=false;allPlayback=false;allFinished=true;
    if(pbs.length){pbs.forEach(b=>done.add(b.id));curSeg=null;}
  }
  if(!playing||(pbs.length&&previous!==curSeg))syncButtons();
}
