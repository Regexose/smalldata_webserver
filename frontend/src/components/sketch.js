export default function sketch(p){
  let canvas;
  let socket;
  var font;
  let fr = 10;  // Frames per second,
  let barWidth, barHeight, yPos, tSize;
  var counterData = {};
  var counter;
  let categories = ["praise", "dissence", "insinuation", "concession", "lecture"];
  let locked = counterData['is_locked'];
  let yOff, xOff, barOff;

  p.preload = () => {
    font = p.loadFont('../../assets/BebasNeue.otf');
    fetchData();
  }


  function findColor(cat) {
    let col = p.color(0);
    if (cat === "praise") {
      col = p.color(196, 128, 79);
    } else if (cat === "dissence") {
      col = p.color(150, 63, 146);
    } else if (cat === "insinuation") {
      col = p.color(21, 143, 84);
    } else if (cat === "lecture") {
      col = p.color(23, 139, 189);
    } else if (cat === "concession") {
      col = p.color(133, 138, 37);
    }
    return col;
  }

  function fetchData() {
    p.httpGet("api/song_state/", "json", false,
      function (response) {
        counterData = response;
        counter = counterData['category_counter'];
        locked = counterData['is_locked'];
      },
      function (response) {
        console.log('Fetching of data unsuccessfull!')
      });
  }

 function onmessage_handler(e) {
   let content = JSON.parse(e["data"]);
   if (content.type === 'confirmation') {
     console.log(content.body);
   } else if (content.type === 'category_counter') {
     counterData = content.body;
     counter = counterData['category_counter'];
     locked = counterData['is_locked'];
   } else {
     console.log('Unknown message type ' + content.type)
   }
 }

  p.setup = () => {
    p.frameRate(fr);
    canvas = p.createCanvas(500, 600);
    tSize= 25;
    yOff = p.height/2;
    xOff = 50;
    barOff = 120;
    barWidth = 60;
    barHeight = 30;
    yPos = 40;
    p.textFont(font, tSize);
    p.textAlign(p.LEFT, p.TOP);
    p.rectMode(p.CENTER);
    p.noStroke();

    // TODO fix proper url (window.location.host is localhost:3000, so the API-port needs to be loaded!
    var socketPath = 'ws://'
            + 'localhost:8000'
            + '/ws/utterance';

    socket = new WebSocket(socketPath);
    console.log("building websocket")

    socket.onmessage = onmessage_handler;
  }

  p.draw = () => {
    if (!counter) {
      // Wait until the counter-data has loaded before drawing.
      return;
    }
    p.background(222);
    displayCounter();
  }

  function displayCounter() {
    if (locked) {
      p.textSize(25);
      p.text('neuer Songpart wird geladen. \nEingabe hat gerade keinen Effekt', 200, yOff , p.width / 2, 200);
    } else {
      for (let i = 0; i < categories.length; i++) {
        let cat = categories[i];
        var limit = p.int(counter[cat].limit);
        var barCount = p.int(counter[cat].count);
        // console.log("cat " + cat + " barcount " + barCount);
        let col = findColor(cat);
        p.fill(col);
        p.textSize(tSize);
        p.noStroke();
        if (limit < 0) {
          barWidth = 0;
          p.text("läuft gerade " + cat + " hat keinen effekt", barOff, yOff + (yPos) * i);
        } else {
          barWidth = 60
        }
        p.text(cat, xOff, yOff + (yPos * i));
        p.rectMode(p.CORNER);
        p.rect(xOff + barOff, yOff + (yPos * i), barCount * barWidth, barHeight);
        // p.rect(xOff + barOff, yOff + (yPos * i), 200, barHeight);
        p.noFill();
        p.rect(xOff + barOff, yOff + (yPos * i), limit * barWidth, barHeight + 5);
        p.fill(2);
        if (barCount >= limit - 2 && limit > 0) {
          p.textSize(18);
          p.text("noch " + (limit + 1 - barCount) + " x " + cat + " bis zum " + cat + "-part", 200 , yOff + (yPos * i));
        }
      }
    }
  }

  p.myCustomRedrawAccordingToNewPropsHandler = (newProps) => {
      if(canvas) { //Make sure the canvas has been created
    }
  }
}
