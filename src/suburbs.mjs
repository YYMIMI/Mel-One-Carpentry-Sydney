// Individual enquiry briefs, not claims about local housing stock or completed jobs.
// Geography membership comes from the existing v3 research-backed directory.
import {popularAreaCandidates} from './content.mjs';
import {suburbDetails} from './suburb-details.mjs';
export const suburbSlug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const briefs = [
 ['S01','If access is through a managed building, describe the window location and any lift or loading arrangements before arranging a timber-frame inspection.','若需经物业管理的建筑进入，请说明木窗位置、电梯及装卸安排，便于安排窗框检查。'],
 ['S02','For a door that rubs after repainting, show the rubbing edge and hinge side; coating build-up and frame movement need different decisions.','木门刷漆后刮擦，请拍摩擦边和铰链侧；积漆与门框移动需要分别判断。'],
 ['S08','When replacing skirting, photograph the profile beside an undamaged length and say whether furniture can be moved away from the wall.','更换踢脚线时，请把线型与完好部分一起拍下，并说明家具能否移开。'],
 ['S01','For a timber sash that sticks, show the whole window and opening mechanism; timber-frame work and specialist balance work are not interchangeable.','木质升降窗卡住，请拍整窗及开启机构；窗框木作与专门平衡机构维修并不相同。'],
 ['S05','For a fence shared with a neighbour, record which posts or rails need attention and whether access to both sides has been discussed.','共用边界围栏，请记录需处理的柱和横梁，并说明是否已沟通两侧进入安排。'],
 ['S02','A front door that no longer meets the latch needs views of the closed gaps and strike plate, not only the handle.','入户门锁舌对不上，请拍关闭缝隙及扣板，而不只是门把手。'],
 ['S09','If several cabinet doors sit unevenly, show one closed overview and the hinge fixings inside before assuming all doors need replacement.','多扇柜门不齐，请拍关闭全景及内部铰链固定处，先不要假定全部换门。'],
 ['S08','For damaged doorway trim, note the profile and where it meets the floor; matching a short section may depend on the existing moulding.','门套线损坏，请记录线型及地面交接；局部匹配取决于现有装饰线。'],
 ['S01','For exposed window timber, show the sill ends and coating condition; distinguish surface wear from softness or loss of timber.','外露窗木材请拍窗台两端及涂层；表面磨损与木材软化、缺损需分清。'],
 ['S02','When a balcony-door surround is damaged, identify which part is timber and show the threshold without stepping into an unsafe opening.','阳台门周边损坏，请说明木制部位，并在安全位置拍门槛。'],
 ['S07','For loose deck boards, photograph the affected boards and accessible support edges; do not stand on the suspect section to test it.','Deck木板松动，请拍坏板及安全可见的支撑边；不要踩上去测试。'],
 ['S05','If a fence has started leaning after bad weather, explain what changed and show the full run; a finish alone will not resolve unstable posts.','天气变化后围栏新出现倾斜，请说明变化并拍整排；表面处理不能解决木柱不稳。'],
 ['S09','For a drawer that drops on one side, provide the runner and cabinet-side fixing photos, plus the drawer width if known.','抽屉一侧下沉，请拍导轨和柜侧固定处，知道宽度也请提供。'],
 ['S08','For loose internal shelves, describe the intended load and show the brackets and fixing surface; stronger boards alone may not solve the issue.','室内层板松动，请说明用途及承重，拍支架与固定基层；只换厚板未必解决。'],
 ['S06','For a timber gate dragging on the ground, show its open and closed positions and the hinge post without forcing the gate.','木闸门刮地，请在不强推的情况下拍开启、关闭状态及铰链门柱。'],
 ['S01','If timber-window repairs are inside a strata property, identify the affected frame and mention any access or approval arrangements already in place.','Strata物业木窗维修，请标明窗框部位，说明已有的通道或批准安排。'],
 ['S03','For timber beside a gutter, take a safe ground-level overview showing the gutter and timber separately; the two scopes may need different trades.','天沟旁木材问题，请从地面安全拍摄天沟与木板全景；两者可能涉及不同工种。'],
 ['S04','If decay appears in more than one place, list each timber component so window, fence and deck repairs can be scoped separately.','多处腐木请逐一列出构件，让窗、围栏和Deck分别界定范围。'],
 ['S07','For a deck with isolated split boards, show the board pattern, edge condition and accessible underside rather than just the worst close-up.','Deck个别木板开裂，请拍铺板方式、边缘及可安全看到的底部，不只拍最坏近照。'],
 ['S05','When fence posts look soft at ground level, note how many are affected and show the adjoining rails before requesting a replacement price.','围栏柱脚疑似软化，请记录数量并拍相连横梁，再咨询更换报价。'],
 ['S06','If the side gate closes but will not latch, show the latch alignment and gaps before choosing replacement hardware.','侧门能关但扣不上，请拍门闩对位和缝隙，再选更换五金。'],
 ['S02','For an internal door scraping the floor, state whether flooring recently changed and show the bottom gap and hinge side.','室内门刮地，请说明是否刚换地板，并拍底缝和铰链侧。'],
 ['S01','For a timber sill with a damaged end, include the adjacent frame joint and the complete sill so local repair and replacement can be compared.','木窗台端部损坏，请连同框角接缝及整条窗台一起拍，比较局部修补与更换。'],
 ['S09','For cabinet hinges pulled out of their fixing holes, show the substrate and hinge plate; a new hinge may not address damaged board.','柜门铰链从孔位脱出，请拍基层和底座；只换铰链未必解决板材破损。'],
 ['S01','For painted window surrounds, tell us whether the issue is appearance, timber damage or opening; those are separate quotation items.','刷漆窗框请说明是外观、木材损坏还是开启问题；这些应分项报价。'],
 ['S07','For deck maintenance, separate coating wear from movement underfoot and include safe photographs of board fixings.','Deck保养请区分涂层磨损与踩踏晃动，提供安全拍摄的固定件照片。'],
 ['S05','For missing or loose fence palings, count the affected boards and show their connection to the rails; retain sound timber where practical.','围栏板缺失或松动，请数出受影响木板并拍横梁连接，评估保留完好木材。'],
 ['S06','For a gate post that moves, show the post base and adjoining fence as well as the gate; rehanging alone may not be enough.','门柱移动，请同时拍柱脚及相连围栏；只重新挂门可能不够。'],
 ['S05','For a longer fence run, mark the affected sections in an overview and distinguish maintenance from complete new installation.','较长围栏请在全景指出坏段，区分维护与全新安装范围。'],
 ['S07','If several deck boards need matching, provide dimensions and an overview of the existing board layout before materials are selected.','多块Deck板需匹配，请提供尺寸及原铺板全景，再确定材料。'],
 ['S06','For a wide timber gate, include both hinges and the latch position; weight, support and hardware need to be considered together.','较宽木闸门请拍两处铰链及门闩；重量、支撑和五金应一起评估。'],
 ['S08','When replacing interior trim around several rooms, group photos by room and note any different profiles to avoid an incomplete quote.','多房间室内线条更换，请按房间整理照片并标出不同线型，避免漏报。'],
 ['S02','For a door-frame repair in a managed property, tell us who can arrange entry and whether the door must remain usable during the work.','管理物业门框维修，请说明谁安排进入，以及施工期间是否需维持门可使用。'],
 ['S09','For a kitchen drawer that jams, photograph the runner markings and the cabinet opening; compatible parts depend on the actual mechanism.','厨房抽屉卡住，请拍导轨标记及柜体开口；配件相容性取决于具体机构。'],
 ['S05','If only one fence section is damaged, show both joining ends to help assess how a repair connects to the sound sections.','仅一段围栏损坏，请拍两端衔接，方便评估与完好部分的连接。'],
 ['S04','If you are unsure whether damaged timber belongs to a window or door surround, start with a room-wide photograph rather than guessing the service.','不清楚坏木材属于窗框还是门套，请先拍房间全景，不必猜服务名称。'],
 ['S05','For routine fence upkeep, list loose boards, visible fixing issues and vegetation touching the timber separately from any leaning sections.','日常围栏保养请分别列出松板、固定件及贴木植物，再单独说明倾斜段。'],
 ['S06','For a gate rubbing against its post, show the contact point and opposite gap; adjusting the latch alone may miss the cause.','闸门擦柱，请拍接触点及另一侧缝隙；只调门闩可能漏掉原因。'],
 ['S03','If an eaves timber joint has opened, show its position relative to the roof edge from the ground and explain any visible staining.','屋檐木接缝张开，请从地面拍与屋边的相对位置，说明可见水渍。'],
 ['S02','For a door with damaged hinge screw holes, show the hinge recess and frame material before selecting larger fixings or timber repair.','门铰链孔破损，请拍槽口及框材，再评估固定件或木材修复。'],
 ['S09','For a cupboard door that has fallen off, keep the loose hardware and photograph the hinge positions without rehanging an unsafe door.','柜门脱落请保留五金、拍原铰链位置，不要强行挂回不稳门板。'],
 ['S08','For a damaged skirting corner, show both runs and the floor junction; a small patch must still suit the existing profile.','踢脚线转角损坏，请拍两侧及地面接缝；小修补也需匹配原线型。'],
 ['S02','If you want door-leaf refinishing and compatible lock replacement together, show the surface and existing hardware as separate parts of the enquiry.','门板翻新和相容换锁一起做，请分别拍表面及现有五金，分清询价范围。'],
 ['S05','For fence repair beside a side passage, include the passage width and any obstacles affecting material removal.','侧通道旁围栏维修，请提供通道宽度及影响拆旧搬运的障碍。'],
 ['S07','For deck repairs near steps, identify whether the fault is in a board, step or supporting timber; avoid using a suspect step for photos.','Deck台阶附近维修，请标明是面板、台阶还是支撑木材；勿踩可疑台阶拍照。'],
 ['S06','For a timber garden gate with split rails, photograph the joints and hinges to distinguish leaf repair from post work.','花园木门横档开裂，请拍接缝及铰链，区分门扇修复与门柱工作。'],
 ['S05','When comparing fence repair and section replacement, ask for the retained parts, replacement parts and disposal scope to be listed.','比较围栏维修和分段更换，请要求列出保留、更换部件及清运范围。'],
 ['S04','For timber deterioration at an outdoor junction, show the adjoining materials and where water appears to collect without claiming a diagnosis.','室外接合处木材损坏，请拍相连材料及疑似积水位置，不必自行下诊断。'],
 ['S01','For window-frame repainting, show peeling areas and frame joints; surface preparation should be quoted separately from timber replacement.','窗框重刷请拍掉漆处和框接缝；表面准备应与换木材分项报价。'],
 ['S02','For a bathroom door with swelling or edge damage, show the lower edge and frame clearance, not just the painted face.','浴室门膨胀或边缘破损，请拍底边及框缝，而不只拍漆面。'],
 ['S09','For replacement drawer runners, provide the mechanism type and opening dimensions if safely accessible; appearance alone cannot confirm compatibility.','更换抽屉导轨，请安全提供机构类型和开口尺寸；外观相似不代表相容。'],
 ['S08','For architraves around a repaired opening, show the complete opening and unfinished junctions so fitting and finishing can be separated.','修补开口周围门套，请拍整开口及未收口处，分清安装与表面处理。'],
 ['S05','For a fence-maintenance quote, provide a full run and close-ups of each different fault rather than many photos of the same board.','围栏保养报价请拍整排及每类不同故障，而不是同一板多张近照。'],
 ['S01','For timber near a sliding window, identify the timber surround separately from the moving window hardware to avoid an incorrect repair scope.','推拉窗旁木材问题，请区分木框与活动窗五金，避免范围判断错误。'],
 ['S07','For replacement deck boards, tell us whether surface finishing is also wanted so materials, fitting and coating are not confused.','Deck换板请说明是否还需表面处理，让材料、安装和涂层范围清楚。'],
 ['S06','For a timber side gate with worn hardware, show the hinge and latch fixings as well as the timber that supports them.','木侧门五金磨损，请同时拍铰链门闩固定处及承托木材。'],
];
let index=0;
export const suburbs=popularAreaCandidates.flatMap(group=>group.names.map(name=>{
 const [service,en,zh]=briefs[index++];
 const slug = suburbSlug(name);
 if (!suburbDetails[slug]) throw new Error('Missing suburb editorial detail: ' + slug);
 return {name,slug,region:group.en,regionZh:group.zh,service,en,zh,detail:suburbDetails[slug],otherNames:group.names.filter(n=>n!==name)};
}));
