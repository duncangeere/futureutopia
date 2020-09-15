// A3
var r = new Rune({
    container: "body",
    width: 1123,
    height: 1587,
    debug: true
});

// Ocean, Conifers, Grassland, Mountain
elements = [{
        "word": "ocean",
        "countrycode": "BR",
        "timestamp": "2017-03-24 20:26:29.04747 UTC",
        "recognized": true,
        "key_id": "5759367188054016",
        "drawing": [
            [
                [14, 33, 58, 98, 124, 152, 175, 210, 230],
                [6, 3, 4, 10, 3, 0, 1, 11, 11]
            ]
        ]
    }, {
        "word": "grass",
        "countrycode": "NZ",
        "timestamp": "2017-03-27 08:32:04.81784 UTC",
        "recognized": true,
        "key_id": "5032868034117632",
        "drawing": [
            [
                [21, 30, 56],
                [60, 82, 177]
            ],
            [
                [91, 108, 108, 104],
                [82, 156, 181, 177]
            ],
            [
                [138, 160, 164, 164, 160],
                [65, 125, 156, 168, 156]
            ],
            [
                [233, 233, 229, 229],
                [74, 117, 130, 156]
            ]
        ]
    },
    {
        "word": "tree",
        "countrycode": "US",
        "timestamp": "2017-03-08 16:54:01.37875 UTC",
        "recognized": true,
        "key_id": "6718527320883200",
        "drawing": [
            [
                [89, 104, 103, 100, 91],
                [115, 195, 237, 245, 249]
            ],
            [
                [136, 136, 139, 147, 167],
                [116, 191, 216, 234, 255]
            ],
            [
                [86, 31, 2, 0, 11, 38, 59, 72, 84, 80, 89, 108, 125, 132, 137, 169, 195, 207, 203, 186, 196, 209, 211, 207, 178, 146],
                [114, 112, 92, 75, 59, 33, 21, 20, 38, 24, 13, 1, 0, 11, 29, 26, 43, 59, 67, 74, 83, 103, 109, 116, 126, 126]
            ]
        ]
    },
    {
        "word": "mountain",
        "countrycode": "US",
        "timestamp": "2017-03-11 22:44:24.65146 UTC",
        "recognized": true,
        "key_id": "5758994649972736",
        "drawing": [
            [
                [0, 38, 46, 50, 57, 72, 77, 82, 91, 94, 102, 107, 116, 127, 132, 139, 151, 153, 154, 164, 181, 191, 204, 208, 218, 225, 230, 255],
                [245, 129, 114, 110, 114, 141, 82, 69, 68, 60, 2, 0, 8, 4, 6, 30, 103, 150, 123, 133, 170, 207, 229, 228, 212, 211, 212, 238]
            ]
        ]
    }

]

function graphic() {

    // field constants
    const margin = 50;
    const w = r.width - (margin * 2)
    const h = r.height - (margin * 2)
    const all = r.group(margin, margin);

    const settlements = 2; // Number of settlements
    const s_rad = 60; // settlement radius
    const s_sep = 400; // separation between settlements
    const s_arr = [];

    const others = 2500; // number of non-settlement circs
    const o_rad = 8; // non-settlement radius
    const o_sep = 4; // separation between other circles
    const o_arr = [];

    const noise = new Rune.Noise().noiseDetail(4, 0.5);
    const nFac = 0.003 // Noise multiplication factor, higher = more zoomed out

    // Empty array to hold all the circles
    const allcircs = [];

    // Create all the settlements
    for (let i = 0; i < settlements; i++) {

        let loc;

        // Set overlappiing to true and reset the number of tries to 0
        let overlap = true;
        let tries = 0;

        // While overlapping is true and you've not tried too many times
        while (overlap && tries < 100) {

            // Generate a location
            loc = new Rune.Vector(Math.random() * w, Math.random() * h);

            // increment the number of tries
            tries += 1

            // Check to see if it's overlapping with an existing circle
            overlap = checkOverlap(loc, s_rad, allcircs, s_sep);
        };

        // If it's not overlapping anything, plot the circle
        if (!overlap) {
            const circ = r.circle(loc.x, loc.y, s_rad, all).fill("none");
            drawSettlement(circ); // Draw a settlement in it

            const savedLoc = { state: { x: loc.x, y: loc.y, radius: s_rad } };

            // Store it in arrays
            allcircs.push(savedLoc);
            s_arr.push(savedLoc);
        }
    }

    // Create all the non-settlements
    for (let i = 0; i < others; i++) {
        let loc;

        // Set overlappiing to true and reset the number of tries to 0
        let overlap = true;
        let tries = 0;

        // While overlapping is true and you've not tried too many times
        while (overlap && tries < 100) {

            // Generate a location
            loc = new Rune.Vector(Math.random() * w, Math.random() * h);

            // increment the number of tries
            tries += 1

            // Check to see if it's overlapping with an existing circle
            overlap = checkOverlap(loc, o_rad, allcircs, o_sep);
        };

        // If it's not overlapping anything, plot the circle
        if (!overlap) {

            // Draw the circle and fill it with the right colour (TK CHANGE)
            //const circ = r.circle(loc.x, loc.y, o_rad, all).fill(getNoiseCol(loc.x, loc.y));
            quickDraw(elements[getLandscapeElement(loc.x, loc.y)].drawing, loc.x - o_rad, loc.y - o_rad, all, o_rad * 2)

            const savedLoc = { state: { x: loc.x, y: loc.y, radius: o_rad } };

            // Store it in arrays
            allcircs.push(savedLoc);
            o_arr.push(savedLoc);
        }
    }

    //quickDraw(elements[1].drawing, 100, 100, all, 200);

    // Function to return a colour based on noise
    function getLandscapeElement(x, y) {

        const level = noise.get(x * nFac, y * nFac);

        if (level > 0.70) { return 3 }; // Mountain
        if (level < 0.30) { return 0 }; // Ocean
        if (level > 0.5) { return 2 }; // Conifers
        if (level <= 0.5) { return 1 }; // Woodland/Grassland

    }

    // Function to draw a settlement inside a circle
    function drawSettlement(c) {
        const x = c.state.x;
        const y = c.state.y;
        const radius = c.state.radius;

        //This group holds all the things in the settlement
        const grp = r.group(x, y, all);

        //Create different possible settlement layouts
        //To draw in the center, set x, y positions to half of width * -1 and half of height * -1
        function possA() {

            //Middle rectangle
            r.rect(-1 * radius * 0.6, -1 * radius * 0.2, radius * 1.2, radius * 0.4, grp).fill("none").rotate(0);

            //4 small squares to the left
            r.rect(-1 * radius * 0.6, -1 * radius * 0.6, radius * 0.1, radius * 0.1, grp).fill("none").rotate(0);
            r.rect(-1 * radius * 0.45, -1 * radius * 0.6, radius * 0.1, radius * 0.1, grp).fill("none").rotate(0);
            r.rect(-1 * radius * 0.6, -1 * radius * 0.45, radius * 0.1, radius * 0.1, grp).fill("none").rotate(0);
            r.rect(-1 * radius * 0.45, -1 * radius * 0.45, radius * 0.1, radius * 0.1, grp).fill("none").rotate(0);

            //4 small squares to the right
            r.rect(radius * 0.5, -1 * radius * 0.6, radius * 0.1, radius * 0.1, grp).fill("none").rotate(0);
            r.rect(radius * 0.35, -1 * radius * 0.6, radius * 0.1, radius * 0.1, grp).fill("none").rotate(0);
            r.rect(radius * 0.5, -1 * radius * 0.45, radius * 0.1, radius * 0.1, grp).fill("none").rotate(0);
            r.rect(radius * 0.35, -1 * radius * 0.45, radius * 0.1, radius * 0.1, grp).fill("none").rotate(0);

            //Small circle top middle
            r.circle(0, -1 * radius * 0.6, radius * 0.25, grp).fill("none");

            //Church in bottom left
            r.rect(-1 * radius * 0.6, radius * 0.35, radius * 0.3, radius * 0.3, grp).fill("none").rotate(0);
            r.line(-1 * radius * 0.6, radius * 0.35, (-1 * radius * 0.6) + (radius * 0.3), (radius * 0.35) + (radius * 0.3), grp);
            r.line((-1 * radius * 0.6) + (radius * 0.3), radius * 0.35, -1 * radius * 0.6, (radius * 0.35) + (radius * 0.3), grp);

            //2 small circles in bottom right
            r.circle(radius * 0.55, radius * 0.5, radius * 0.13, grp).fill("none");
            r.circle(radius * 0.2, radius * 0.7, radius * 0.13, grp).fill("none");
        }


        function possB() {

            //Church in the middle
            r.rect(-1 * radius * 0.4 / 2, -1 * radius * 0.4 / 2, radius * 0.4, radius * 0.4, grp).fill("none").rotate(0);
            r.line(-1 * radius * 0.4 / 2, -1 * radius * 0.4 / 2, (-1 * radius * 0.4 / 2) + (radius * 0.4), (-1 * radius * 0.4 / 2) + (radius * 0.4), grp);
            r.line((-1 * radius * 0.4 / 2) + radius * 0.4, -1 * radius * 0.4 / 2, -1 * radius * 0.4 / 2, (-1 * radius * 0.4 / 2) + (radius * 0.4), grp);

            r.rect(radius * 0.45, -1 * radius * 0.45, radius * 0.3, radius * 0.9, grp).fill("none").rotate(135, 0, 0);
            r.rect(radius * 0.45, -1 * radius * 0.45, radius * 0.3, radius * 0.9, grp).fill("none").rotate(315, 0, 0);

            // String of circles along the outer edge 
            for (let i = 0; i < 60; i = i + 20) {
                let x = Math.cos(Rune.radians(i)) * radius * 0.8;
                let y = Math.sin(Rune.radians(i)) * radius * 0.8;

                r.circle(x, y, radius * 0.1, grp).fill("none").rotate(370, 0, 0);
            }

            for (let i = 0; i < 60; i = i + 20) {
                let x = Math.cos(Rune.radians(i)) * radius * 0.8;
                let y = Math.sin(Rune.radians(i)) * radius * 0.8;

                r.circle(x, y, radius * 0.1, grp).fill("none").rotate(190, 0, 0);
            }
        }

        function possC() {

            //3 rectangle: middle, left, bottom
            r.rect(radius * 0.6, -1 * radius * 0.45, radius * 0.2, radius * 0.9, grp).fill("none").rotate(270, 0, 0);
            r.rect(radius * 0.6, -1 * radius * 0.45, radius * 0.2, radius * 0.9, grp).fill("none").rotate(180, 0, 0);
            r.rect(radius * 0.6, -1 * radius * 0.45, radius * 0.2, radius * 0.9, grp).fill("none").rotate(90, 0, 0);

            //Circles with circles inside, right
            for (let i = 0; i < 90; i = i + 30) {
                let x = Math.cos(Rune.radians(i)) * radius * 0.75;
                let y = Math.sin(Rune.radians(i)) * radius * 0.75;

                r.circle(x, y, radius * 0.15, grp).fill("none").rotate(330, 0, 0);
                r.circle(x, y, radius * 0.07, grp).fill("none").rotate(330, 0, 0);
            }

            //4 squares in the middle
            //Upper left church
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.25), -1 * radius * 0.2 / 2, radius * 0.2, radius * 0.2, grp).fill("none").rotate(45, 0, 0);
            r.line(-1 * radius * 0.2 / 2 - (radius * 0.25), -1 * radius * 0.2 / 2, (-1 * radius * 0.2 / 2) + (radius * 0.2) - (radius * 0.25), (-1 * radius * 0.2 / 2) + (radius * 0.2), grp).rotate(45, 0, 0);
            r.line((-1 * radius * 0.2 / 2) + (radius * 0.2) - (radius * 0.25), -1 * radius * 0.2 / 2, -1 * (radius * 0.2 / 2) - (radius * 0.25), (-1 * radius * 0.2 / 2) + (radius * 0.2), grp).rotate(45, 0, 0);

            //Lower right church
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.25), -1 * radius * 0.2 / 2, radius * 0.2, radius * 0.2, grp).fill("none").rotate(225, 0, 0);
            r.line(-1 * radius * 0.2 / 2 - (radius * 0.25), -1 * radius * 0.2 / 2, (-1 * radius * 0.2 / 2) + (radius * 0.2) - (radius * 0.25), (-1 * radius * 0.2 / 2) + (radius * 0.2), grp).rotate(225, 0, 0);
            r.line((-1 * radius * 0.2 / 2) + (radius * 0.2) - (radius * 0.25), -1 * radius * 0.2 / 2, -1 * (radius * 0.2 / 2) - (radius * 0.25), (-1 * radius * 0.2 / 2) + (radius * 0.2), grp).rotate(225, 0, 0);

            //Upper right group of 4 squares
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.25), -1 * radius * 0.2 / 2, radius * 0.08, radius * 0.08, grp).fill("none").rotate(135, 0, 0);
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.35), -1 * radius * 0.2 / 2, radius * 0.08, radius * 0.08, grp).fill("none").rotate(135, 0, 0);
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.25), -1 * (radius * 0.2 / 2) + (radius * 0.1), radius * 0.08, radius * 0.08, grp).fill("none").rotate(135, 0, 0);
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.35), -1 * (radius * 0.2 / 2) + (radius * 0.1), radius * 0.08, radius * 0.08, grp).fill("none").rotate(135, 0, 0);

            //Lower left group of 4 squares
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.25), -1 * radius * 0.2 / 2, radius * 0.08, radius * 0.08, grp).fill("none").rotate(315, 0, 0);
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.35), -1 * radius * 0.2 / 2, radius * 0.08, radius * 0.08, grp).fill("none").rotate(315, 0, 0);
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.25), -1 * (radius * 0.2 / 2) + (radius * 0.1), radius * 0.08, radius * 0.08, grp).fill("none").rotate(315, 0, 0);
            r.rect(-1 * radius * 0.2 / 2 - (radius * 0.35), -1 * (radius * 0.2 / 2) + (radius * 0.1), radius * 0.08, radius * 0.08, grp).fill("none").rotate(315, 0, 0);

        }

        function possD() {
            //Circles with circles inside, right
            for (let i = 0; i < 60; i = i + 30) {
                let x = Math.cos(Rune.radians(i)) * radius * 0.75;
                let y = Math.sin(Rune.radians(i)) * radius * 0.75;

                r.circle(x, y, radius * 0.15, grp).fill("none").rotate(270, 0, 0);
                r.circle(x, y, radius * 0.07, grp).fill("none").rotate(270, 0, 0);
            }

            //2 squares distributed along side
            r.rect(radius * 0.5, (-1 * radius * 0.4) + (radius * 0.05), radius * 0.3, radius * 0.3, grp).fill("none").rotate(0);
            r.rect(radius * 0.5, (-1 * radius * 0.4) + (radius * 0.3) + (radius * 0.2), radius * 0.3, radius * 0.3, grp).fill("none").rotate(0);

            //6 silos near the bottom
            r.circle(radius * 0.5 - (radius * 0.5), -1 * radius * 0.6 - (radius * 0.1), radius * 0.06, grp).fill("none").rotate(180, 0, 0);
            r.circle(radius * 0.35 - (radius * 0.5), -1 * radius * 0.6 - (radius * 0.1), radius * 0.06, grp).fill("none").rotate(180, 0, 0);
            r.circle(radius * 0.5 - (radius * 0.5), -1 * radius * 0.45 - (radius * 0.1), radius * 0.06, grp).fill("none").rotate(180, 0, 0);
            r.circle(radius * 0.35 - (radius * 0.5), -1 * radius * 0.45 - (radius * 0.1), radius * 0.06, grp).fill("none").rotate(180, 0, 0);
            r.circle(radius * 0.65 - (radius * 0.5), -1 * radius * 0.45 - (radius * 0.1), radius * 0.06, grp).fill("none").rotate(180, 0, 0);
            r.circle(radius * 0.65 - (radius * 0.5), -1 * radius * 0.6 - (radius * 0.1), radius * 0.06, grp).fill("none").rotate(180, 0, 0);

            //Cross shaped rectangles with circle in the middle
            r.circle(1 - radius * 0.4, 0, radius * 0.1, grp).fill("none");
            r.rect(1 - radius * 0.4 - (radius * 0.05), (radius * 0.15), radius * 0.1, radius * 0.3, grp).fill("none").rotate(90, 1 - radius * 0.4, 0);
            r.rect(1 - radius * 0.4 - (radius * 0.05), (radius * 0.15), radius * 0.1, radius * 0.3, grp).fill("none").rotate(0, 1 - radius * 0.4, 0);
            r.rect(1 - radius * 0.4 - (radius * 0.05), (radius * 0.15), radius * 0.1, radius * 0.3, grp).fill("none").rotate(180, 1 - radius * 0.4, 0);
            r.rect(1 - radius * 0.4 - (radius * 0.05), (radius * 0.15), radius * 0.1, radius * 0.3, grp).fill("none").rotate(270, 1 - radius * 0.4, 0);

        }

        function possE() {

            //2 squares on the top
            const sqSize = radius * 0.25;
            const gutter = radius * 0.2;

            const x1 = -1 * (2 * sqSize + 1.5 * gutter);
            const x2 = -1 * (sqSize + 0.5 * gutter);
            const x3 = 0.5 * gutter;
            const x4 = sqSize + 1.5 * gutter;

            const y1 = -1 * (2 * sqSize + 1.5 * gutter);
            const y2 = -1 * (sqSize + 0.5 * gutter);
            const y3 = 0.5 * gutter;
            const y4 = sqSize + 1.5 * gutter;

            r.rect(x1, y2, sqSize, sqSize, grp).fill("none");
            r.rect(x2, y2, sqSize, sqSize, grp).fill("none").rotate(45, x2 + sqSize / 2, y2 + sqSize / 2);
            r.rect(x3, y2, sqSize, sqSize, grp).fill("none").rotate(45, x3 + sqSize / 2, y2 + sqSize / 2);
            r.rect(x4, y2, sqSize, sqSize, grp).fill("none");

            r.rect(x1, y3, sqSize, sqSize, grp).fill("none");
            r.rect(x2, y3, sqSize, sqSize, grp).fill("none").rotate(45, x2 + sqSize / 2, y3 + sqSize / 2);
            r.rect(x3, y3, sqSize, sqSize, grp).fill("none").rotate(45, x3 + sqSize / 2, y3 + sqSize / 2);
            r.rect(x4, y3, sqSize, sqSize, grp).fill("none");

            r.rect(x2, y1, sqSize, sqSize, grp).fill("none");
            r.rect(x3, y1, sqSize, sqSize, grp).fill("none");
            r.rect(x2, y4, sqSize, sqSize, grp).fill("none");
            r.rect(x3, y4, sqSize, sqSize, grp).fill("none");
        }

        const chooser = Math.random();
        if (chooser > 0.75) {
            possA();
        } else if (chooser > 0.5) {
            possB();
        } else if (chooser > 0.25) {
            possC();
        } else {
            possD();
        };

        //Rotate the settlement a random amount
        grp.rotate(Rune.random(0, 360), x, y);
        return grp;
    }

    // Function to check overlaps, 
    // takes a possible vector position and an array of circles as arguments
    function checkOverlap(newPos, newSize, allcircs, sep) {

    	if (newPos.distance(new Rune.Vector(w/2, h/2)) > (w/2 - newSize)) return true;

        if (newPos.x < newSize * 1.5 || newPos.x > w - newSize * 1.5 || newPos.y < newSize * 1.5 || newPos.y > h - newSize * 1.5) return true;

        // Loop over all the circles
        for (let circ of allcircs) {

            // Make a vector out of the current circle position
            const circPos = new Rune.Vector(circ.state.x, circ.state.y)

            // Compare the distance between that vector and the new position 
            // vector with the size. Reurn true if they overlap.
            if (circPos.distance(newPos) < circ.state.radius + newSize + sep) return true;
        };

        // Otherwise return false
        return false;
    }

    // Draw a shape from the quickDraw dataset
    function quickDraw(array, x, y, grp, scale) {

        // Calculate scale factor
        const sf = scale / 255;

        // Start the path
        const path = r.path(x, y, grp).fill("none")

        // Loop over the array of strokes
        for (let line of array) {

            // Scale the points to the desired graphic width
            const xpoints = line[0].map(x => x * sf);
            const ypoints = line[1].map(y => y * sf);

            // Check point arrays are the same length
            if (xpoints.length == ypoints.length) {

                // Move the drawing cursor to the first point
                path.moveTo(xpoints[0], ypoints[0])

                // Loop over the rest of the points and draw to them in turn
                for (let i = 1; i < xpoints.length; i++) {
                    path.lineTo(xpoints[i], ypoints[i])
                }

                // Error if point arrays aren't the same length
            } else { console.log("ERROR! xpoint and ypoint arrays are not equal in length") }
        }
    }
}

// Draw it 
graphic();
r.draw();