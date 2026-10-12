// SkateProgress curriculum: original checkpoints and goals, informed by the sources below.
const task=(id,title,goal,hint,target=1,trick=null,xp=20)=>({id,title,goal,hint,target,trick,xp});
const level=(id,number,track,title,description,requires,tasks,badge)=>({id,number,track,title,description,requires,tasks,badge});
export const SOURCES=[
 {name:'Skateboard GB · Cruiser Award',url:'https://skateboardgb.org/beginners/cruiser-award/',note:'Stand, Balance, Anfahren, Kurven und Stoppen als Fundament; danach unterschiedliche Skate-Wege.'},
 {name:'Skateboard GB · Learn to Skate',url:'https://skateboardgb.org/beginners/learn-to-skate-guide/',note:'Orientierung für Boardgefühl und sichere erste Übungen.'},
 {name:'Braille · Fundamentals',url:'https://www.brailleskateboarding.com/products/level-2-fundamentals',note:'Einfache Erfolgserlebnisse und Boardkontrolle vor komplexeren Pop-Tricks.'},
 {name:'Braille · Basic Tricks',url:'https://www.brailleskateboarding.com/products/skateboarding-made-simple-volume-1-digital-download',note:'Ollie, Drehungen, Shove-it und erste Flips als Flatground-Bausteine.'},
 {name:'Skate IQ · Core',url:'https://skateiq.com/collections/bundles/products/core-90-day-program',note:'Boardkontrolle als Basis, dann Ollie- und Flip-Mechanik.'}
];
export const LEVELS=[
 level('board1',1,'Grundlagen','Dein erster Stand','Ankommen, ohne dass das Board davonrollt.',[],[
  task('setup','Board & Platz prüfen','Passenden Übungsplatz und Ausrüstung gewählt.','Ebene freie Fläche, funktionierendes Board, flache Schuhe und passend sitzender Helm.'),
  task('stance','Regular oder Goofy?','Deinen bevorzugten vorderen Fuß gefunden.','Probiere beide Stellungen auf einem gegen Wegrollen gesicherten Board.'),
  task('step','Auf- und absteigen','Fünfmal kontrolliert aufsteigen und wieder absteigen.','Erst ohne Fahrt üben; dein Gewicht bleibt zwischen den Achsen.',5),
  task('squat','Locker stehen','Dreimal leicht in die Knie gehen und wieder aufrichten.','Füße ungefähr über den Achsschrauben; nicht verkrampft aufrecht stehen.',3)
 ],'Board Buddy'),
 level('board2',2,'Grundlagen','Die ersten Meter','Vom Stehen zum langsamen Rollen.',['board1'],[
  task('push','Ein Push, dann rollen','Fünf kontrollierte Starts auf ebener Fläche.','Nach dem Abstoßen den hinteren Fuß aufsetzen. Geschwindigkeit bleibt niedrig.',5,'Pushing'),
  task('front_balance','Einbeinige Balance','Kurz auf dem vorderen Fuß stehen, ohne wegzukippen.','Übe die Gewichtsverteilung erst mit gesichertem Board.'),
  task('feet_turn','Füße ausrichten','Dreimal vom Push-Stand in den Fahrstand wechseln.','Den vorderen Fuß nach dem Pushen kontrolliert querstellen.',3),
  task('coast','Geradeaus rollen','Fünfmal eine kurze freie Strecke entspannt rollen.','Schau nach vorn und wähle genug Platz zum Ausrollen.',5)
 ],'Erste Meter'),
 level('board3',3,'Grundlagen','Du hast die Bremse','Geschwindigkeit bewusst kontrollieren.',['board2'],[
  task('brake','Foot Brake','Fünfmal langsam anfahren und kontrolliert stoppen.','Mit dem Push-Fuß dosiert Bodenberührung üben; keine Gefällestrecke.',5,'Foot Brake'),
  task('slow_step','Langsam absteigen','Dreimal aus sehr langsamer Fahrt kontrolliert absteigen.','Nur Gehgeschwindigkeit. Absteigen ersetzt keine Bremstechnik bei höherem Tempo.',3),
  task('stop_zone','An einer Linie stoppen','Dreimal in einem großzügigen Zielbereich anhalten.','Der Zielbereich ist eine Orientierung, kein Wettkampf um den kürzesten Bremsweg.',3),
  task('stop_line','Start → Rollen → Stoppen','Diesen Ablauf dreimal ohne hektische Bewegung verbinden.','Erst weitergehen, wenn Starten und Stoppen zuverlässig sind.',3)
 ],'Kontrolle zuerst'),
 level('board4',4,'Grundlagen','Kurven & Richtung','Das Board gezielt führen.',['board3'],[
  task('carve','Links und rechts lenken','Je drei weite Kurven in beide Richtungen.','Beginne mit großen Bögen auf freier ebener Fläche.',6),
  task('tic','Tic Tac','Eine kurze Reihe kleiner Richtungswechsel.','Nur kleine Bewegungen, statt die Nose stark anzuheben.',3,'Tic Tac'),
  task('kickturn','Kleine Kickturns','Je drei kleine Drehungen in beide Richtungen.','Erst kleine Winkel, dann mehr Drehung. Noch keine Rampe nötig.',6,'Kickturn'),
  task('slalom','Eine ruhige Slalom-Line','Dreimal einen weiten Slalom mit anschließendem Stopp.','Flache Markierungen und viel Abstand verwenden.',3)
 ],'Cruiser'),
 level('board5',5,'Grundlagen','Boardgefühl ohne Ollie','Balance und kleine Erfolgserlebnisse.',['board4'],[
  task('manual','Kurzer Manual','Dreimal kurz auf den hinteren Rollen balancieren.','Wenige Zentimeter reichen. Nicht auf Länge oder Tempo gehen.',3,'Manual'),
  task('fakie_roll','Fakie rollen','Dreimal langsam rückwärts rollen und wieder stoppen.','In die Fahrtrichtung schauen; zuerst auf ebener freier Fläche.',3,null),
  task('hippie','Kleiner Hippie Jump','Dreimal klein abspringen und auf dem Board landen.','Ohne Hindernis, zuerst im Stand, dann nur bei sehr langsamer Fahrt.',3,'Hippie Jump'),
  task('body_varial','Body Varial entdecken','Eine kontrollierte Körperdrehung auf dem Board.','Erst mit gesichertem Board kennenlernen; Board dreht hier nicht mit.',1,'Body Varial')
 ],'Board Explorer'),
 level('style1',1,'No-Pop & Style','Erste Footplants','Kleine Tricks als eigener Weg, kein Muss vor dem Ollie.',['board4'],[
  task('caveman','Caveman','Drei kleine kontrollierte Landungen.','Fußstellung zunächst im Stand kennenlernen. Mit Tutorial oder Anleitung und freier Landefläche üben.',3,'Caveman',25),
  task('boneless','Boneless','Drei kleine kontrollierte Landungen.','Erst den Fuß- und Handablauf verstehen, dann einen sehr kleinen Sprung üben.',3,'Boneless',30),
  task('no_comply','No Comply','Drei kontrollierte Landungen.','Footplant und Boardbewegung als eigenes kleines Projekt kennenlernen.',3,'No Comply',30),
  task('style_body','Body Varial festigen','Drei ruhige Körperdrehungen bei sehr langsamer Fahrt.','Erst die Standübung sicher beherrschen; das Board muss nicht mitdrehen.',3,'Body Varial',25)
 ],'Footplant Explorer'),
 level('flat1',6,'Flatground','Dein erster Pop','Den Ollie Schritt für Schritt kennenlernen.',['board4'],[
  task('pop_setup','Pop und Fußposition','Den Bewegungsablauf langsam nachvollziehen können.','Zerlege die Bewegung. Ein sauberer kleiner Sprung zählt mehr als Höhe.'),
  task('ollie_still','Ollie im Stand','Drei kontrollierte kleine Ollies landen.','Beide Füße bleiben auf dem Board; nach der Landung stabil stehen.',3,'Ollie',30),
  task('ollie_roll','Ollie beim Rollen','Drei Ollies bei langsamer Fahrt landen.','Nur auf ebener Fläche und mit genügend Auslauf.',3,'Ollie',30),
  task('ollie_line','Ollie wiederholen','Drei ruhige Roll-Ollies in einer Session.','Nicht hintereinander erzwingen; zwischen Versuchen neu ausrichten.',3,'Ollie',30)
 ],'Pop Starter'),
 level('flat2',7,'Flatground','Das Board dreht','Shove-it und Pop Shove-it.',['flat1'],[
  task('shove','Shove-it','Drei kleine Shove-its kontrolliert landen.','Zunächst wenig Tempo; das Board dreht unter dir.',3,'Shove-it',30),
  task('popshove','Pop Shove-it','Drei Pop Shove-its landen.','Erst Rotation und Landung, dann mehr Pop.',3,'Pop Shove-it',30),
  task('fs_popshove','Frontside Pop Shove-it','Drei kontrollierte Landungen.','Andere Drehrichtung separat lernen; nicht automatisch als gleich schwer ansehen.',3,'Frontside Pop Shove-it',30),
  task('line','Zwei Tricks verbinden','Eine ruhige Line aus zwei bereits sicheren Tricks.','Zwischen den Tricks weiterrollen; einfache Tricks reichen.',1,null,30)
 ],'Board Spinner'),
 level('flat3',8,'Flatground','Du drehst mit','Körper und Board gemeinsam.',['flat1'],[
  task('fs180','Frontside 180','Drei kontrollierte Frontside-180-Landungen.','Den Bewegungsablauf zunächst mit kleinen Drehungen kennenlernen.',3,'Frontside 180',35),
  task('bs180','Backside 180','Drei kontrollierte Backside-180-Landungen.','Als eigene Fähigkeit üben; nicht aus Frontside ableiten.',3,'Backside 180',35),
  task('fakie','Fakie Ollie','Drei kleine Fakie Ollies bei niedriger Geschwindigkeit.','Fakie-Rollen vorher beherrschen.',3,'Fakie Ollie',35),
  task('half_cab','Half Cab','Drei kontrollierte Half Cabs landen.','Fakie Ollie und Drehung kombinieren, erst wenn beides vertraut ist.',3,'Half Cab',35)
 ],'Rotation Rider'),
 level('flat4',9,'Flatground','Dein erster Flip','Kickflip oder Heelflip als zwei eigene Projekte.',['flat2'],[
  task('flip_setup','Flip-Bewegung verstehen','Einen Flip auswählen und dessen Bewegung erklären können.','Ein Tutorial ansehen und den Ablauf langsam zerlegen.'),
  task('kickflip','Kickflip','Drei saubere Kickflip-Landungen.','Wähle zunächst kleine Versuche; die Landung zählt, nicht die Höhe.',3,'Kickflip',45),
  task('heelflip','Heelflip','Drei saubere Heelflip-Landungen.','Kann sich leichter oder schwerer als Kickflip anfühlen. Eigenes Tempo zählt.',3,'Heelflip',45),
  task('flip_repeat','Deinen Lieblingsflip festigen','Drei kontrollierte Landungen deines bevorzugten Flips.','Kein Zeitlimit. Lieber den sicheren Bewegungsablauf wiederholen.',3,null,35)
 ],'Flip Explorer'),
 level('flat5',10,'Flatground','Deine eigene Line','Bausteine sicher kombinieren.',['flat3'],[
  task('session','Eine Session abschließen','Eine Session mit eigenen Notizen speichern.','Notiere eine Sache, die geklappt hat, und eine für das nächste Mal.'),
  task('combo_line','Drei Tricks in einer Line','Eine Line aus drei bereits sicheren Tricks.','Einfache Tricks zählen. Neue Tricks nicht unter Druck verbinden.',1,null,40),
  task('bigspin','Bigspin kennenlernen','Drei kontrollierte Bigspin-Landungen.','Boardrotation und Körperrotation erst einzeln vertraut machen.',3,'Backside Bigspin',45),
  task('manual_line','Manual in einer Line','Eine kurze Balancephase in deine Line einbauen.','Keine Kante oder zusätzliche Höhe nötig.',1,'Manual',35)
 ],'Line Builder'),
 level('ramp1',1,'Transition','Rampen kennenlernen','Ein eigener Weg: keine Flips nötig.',['board4'],[
  task('park_rules','Spot lesen','Fahrwege, Auslauf und andere Skater berücksichtigen.','Schau zuerst zu und kläre vor dem Losfahren, ob die Fläche frei ist.'),
  task('bank_up','Flache Bank hochrollen','Dreimal eine sanfte Schräge kontrolliert hochrollen.','Klein anfangen und genügend freien Auslauf wählen.',3),
  task('bank_down','Flache Bank herunterrollen','Dreimal eine sanfte Schräge kontrolliert herunterrollen.','Nur eine Schräge, deren Tempo du kontrollieren kannst.',3),
  task('bank_fakie','Zurück fakie ausrollen','Dreimal auf kleiner Schräge hoch- und rückwärts zurückrollen.','Fakie auf Flat vorher lernen; auf freie Fahrwege achten.',3)
 ],'Bank Buddy'),
 level('ramp2',2,'Transition','Rhythmus & Pumping','Geschwindigkeit durch kontrollierte Bewegung.',['ramp1'],[
  task('pump','Pumping','Einen ruhigen Rhythmus in flacher Transition finden.','Erst kleine Bewegungen, nicht Höhe maximieren.',3,'Pumping',30),
  task('ramp_turn_bs','Backside Kickturn auf der Bank','Drei kleine kontrollierte Drehungen.','Unterhalb der Oberkante bleiben und kleine Winkel wählen.',3),
  task('ramp_turn_fs','Frontside Kickturn auf der Bank','Drei kleine kontrollierte Drehungen.','Andere Seite unabhängig kennenlernen.',3),
  task('ramp_flow','Eine ruhige Rampen-Line','Hochrollen, drehen und kontrolliert ausrollen verbinden.','Kleine Flächen reichen. Du brauchst keinen Drop-in.',1,null,35)
 ],'Transition Flow'),
 level('ramp3',3,'Transition','Erste Coping-Bausteine','Mit Anleitung an niedriger Rampe.',['ramp2'],[
  task('dropin','Drop-in','Eine kontrollierte Landung mit geeigneter Anleitung.','Erster Drop-in mit Coach oder erfahrener Unterstützung an niedriger geeigneter Rampe.',1,'Drop-in',40),
  task('rock_fakie','Rock to Fakie','Drei kontrollierte Rückfahrten.','Fakie und sicheres Freikommen vom Coping vorher mit Anleitung lernen.',3,'Rock to Fakie',40),
  task('axle_stall','Axle Stall','Eine kontrollierte Stall-Position und Rückfahrt.','An niedriger Rampe mit Unterstützung üben.',1,'Axle Stall',40),
  task('rock_roll','Rock and Roll','Eine kontrollierte Drehung zurück in die Rampe.','Kein Pflichtschritt für alle Skater. Nur bei passender Umgebung üben.',1,'Rock and Roll',45)
 ],'Coping Explorer'),
 level('ledge1',1,'Ledges & Slides','Kante verstehen','Niedrig anfangen, bevor du rutschst.',['flat1'],[
  task('ledge_check','Eine geeignete Kante wählen','Niedrige legale Übungskante und freien Auslauf gefunden.','Keine Treppen oder hohen Rails. Untergrund und Platz prüfen.'),
  task('ledge_approach','Anfahrt kontrollieren','Dreimal die Kante anfahren und daneben ausrollen.','Zuerst ohne Trick Richtung und Abstand kennenlernen.',3),
  task('5050_stall','50-50-Position','Eine stabile Achsposition auf niedriger Kante kennenlernen.','Erst als Standübung und mit erfahrener Anleitung.'),
  task('5050','Kurzer 50-50 Grind','Drei kontrollierte kurze Grinds auf niedriger Kante.','Technik und Ausstieg zählen, nicht Länge oder Geschwindigkeit.',3,'50-50 Grind',40)
 ],'Ledge Starter'),
 level('ledge2',2,'Ledges & Slides','Erste Slides','Die Gleitposition separat kennenlernen.',['ledge1'],[
  task('boardslide','Backside Boardslide','Drei kurze kontrollierte Slides.','Niedrige geeignete Übungsfläche; Einstieg und Ausstieg zuerst kennenlernen.',3,'Backside Boardslide',40),
  task('noseslide','Frontside Noseslide','Drei kurze kontrollierte Slides.','Position zunächst an sehr niedriger Kante kennenlernen.',3,'Frontside Noseslide',40),
  task('fs_boardslide','Frontside Boardslide','Drei kontrollierte Landungen.','Erst üben, wenn die Bewegung vertraut ist; eigenständige Schwierigkeit.',3,'Frontside Boardslide',45),
  task('ledge_line','Deine erste Kanten-Line','Eine vertraute Anfahrt mit einem sicheren Trick verbinden.','Nur bereits beherrschte Bausteine nutzen.',1,null,40)
 ],'Slide Explorer'),
 level('switch1',1,'Switch & Nollie','Die andere Fußstellung','Zurück zu den Basics.',['board4'],[
  task('switch_stand','Switch stehen','Eine entspannte ungewohnte Fußstellung finden.','Erst ohne Fahrt. Regular/Goofy ist dein Grundstand, Switch die andere Stellung.'),
  task('switch_push','Switch pushen','Fünf kontrollierte Starts.','Beginne wieder langsam und auf ebener Fläche.',5),
  task('switch_stop','Switch stoppen','Fünf kontrollierte Stopps.','Die Bremse in dieser Fußstellung separat üben.',5),
  task('switch_turn','Switch lenken','Je drei weite Kurven in beide Richtungen.','Nicht gleich deinen gewohnten Schwierigkeitsgrad erwarten.',6)
 ],'Both Ways'),
 level('switch2',2,'Switch & Nollie','Nose statt Tail','Neue Pop- und Fahrvarianten.',['switch1','flat1'],[
  task('switch_ollie','Switch Ollie','Drei kleine kontrollierte Landungen.','Erst wenn Switch-Fahren und Stoppen zuverlässig sind.',3,'Switch Ollie',40),
  task('nollie','Nollie','Drei kleine kontrollierte Landungen.','Nose-Pop in deiner gewohnten Fußstellung kennenlernen.',3,'Nollie',40),
  task('nollie_shove','Nollie Shove-it','Drei kontrollierte Landungen.','Kleine Drehung und niedrige Geschwindigkeit.',3,'Nollie Shove-it',40),
  task('fakie_shove','Fakie Shove-it','Drei kontrollierte Landungen.','Fakie-Fahren bleibt die Voraussetzung.',3,'Fakie Shove-it',35)
 ],'New Directions')
];
export function levelComplete(level,quests){return level.tasks.every(t=>quests.includes(t.id));}
export function levelUnlocked(level,quests){return level.requires.every(id=>{const required=LEVELS.find(l=>l.id===id);return required&&levelComplete(required,quests);});}
export function learningSummary(quests){const done=new Set(quests),tasks=LEVELS.flatMap(l=>l.tasks);return {xp:tasks.filter(t=>done.has(t.id)&&!t.trick).reduce((sum,t)=>sum+t.xp,0),completed:tasks.filter(t=>done.has(t.id)).length,total:tasks.length,badges:LEVELS.filter(l=>levelComplete(l,quests)).map(l=>l.badge),next:LEVELS.find(l=>levelUnlocked(l,quests)&&!levelComplete(l,quests))};}
export function findTask(id){for(const level of LEVELS){const task=level.tasks.find(t=>t.id===id);if(task)return {level,task};}return null;}
export function advanceTask(state,id){const found=findTask(id);if(!found||!levelUnlocked(found.level,state.quests))return false;state.learning??={counts:{}};state.learning.counts??={};if(state.quests.includes(id))return false;const next=id==='ollie_line'?found.task.target:Math.min(found.task.target,(state.learning.counts[id]||0)+1);state.learning.counts[id]=next;if(next>=found.task.target)state.quests.push(id);return true;}
