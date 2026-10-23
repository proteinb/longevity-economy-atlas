export const items = [
  {id:'care-bed',name:'护理床',src:'./care-bed.html',summary:'从一张护理床开始，<br>看懂产品，也看见日常。',scope:'概念交互示意 / 非具体产品',focus:[['像家具，融入家','温和配色，轻盈轮廓。让照护空间保留家的感觉。'],['手控，直观可见','播放靠背动作示意，观察操作与活动部件的关联。'],['清洁，少些负担','观察表面与缝隙。实际材质和拆洗方式，待产品验证。']]},
  {id:'smart-toilet',name:'智能马桶',src:'./figures/smart-toilet.html',summary:'从开盖到冲水，<br>看一次如厕的流程。',scope:'用户附件 / 教学示意',focus:[['一段日常流程','分步观察开盖、清洗、烘干和冲水。'],['看见简化水路','转动与透视，理解部件如何在示意中关联。'],['读数是动画算例','温度、流量与保护逻辑，仍需具体型号资料验证。']]},
  {id:'smoke-alarm',name:'烟雾报警器',src:'./figures/smoke-alarm.html',summary:'烟进入，光散射，<br>看懂报警的示意过程。',scope:'用户附件 / 教学示意',focus:[['从烟到信号','分步观察进烟、散射与信号判断。'],['部件一起亮起','把光室、传感部件和提示灯联系起来。'],['示意不等于检测','阈值、声压与实际报警效果未经测试。']]},
  {id:'accessible-shower',name:'无障碍淋浴间',src:'./figures/accessible-shower.html',summary:'从入口到淋浴，<br>观察空间与动作的关系。',scope:'用户附件 / 空间教学示意',focus:[['看空间关系','观察入口、回转区、浴凳与抓杆的位置。'],['分步探索','选择进入、淋浴、排水与呼叫等示意环节。'],['尺寸仍需验证','动画不构成施工图、适配评估或转移操作指导。']]}
];
export const resolveItem = value => items.find(x=>x.id===value)||items[0];
export const neighbor = (id,step) => items[(items.findIndex(x=>x.id===resolveItem(id).id)+step+items.length)%items.length];
