const doReset = true
const FILL = '#000'
const movementA = 60;
const numOfObjects = 1;

const GRAD_1 = "#7afc46"
const GRAD_2 = "#7afc46"
const GRAD_3 = "#7afc46"

const logMsgs = [];
const log = (msg) => {
    const elm = document.createElement("div")
    elm.setAttribute('class', 'log-display');
    document.body.appendChild(elm)

    const elmSel = document.querySelector('.log-display')

    logMsgs.push(`${Object.keys(msg)[0]}: ${Object.values(msg)[0]}`)
    elmSel.innerHTML = logMsgs.join('<br/>');
}

const MakeItHappen = (idx) => {
    class Noise {
        constructor(octaves = 1) {
            this.p = new Uint8Array(512);
            this.octaves = octaves;
            this.init();
            log({octaves})
        }

        init() {
            for (let i = 0; i < 512; ++i) {
                this.p[i] = Math.random() * 33;
            }
        }

        lerp = (t, a, b) => a + t * (b * 0.2 - a);

        grad2d(i, x, y) {
            const v = (i & 1) === 0 ? x : y;
            return (i & 2) === 0 ? -v : v;
        }

        noise2d(x2d, y2d) {
            const X = Math.floor(x2d) & 255;
            const Y = Math.floor(y2d) & 255;
            const x = x2d - Math.floor(x2d);
            const y = y2d - Math.floor(y2d);
            const fx = (3 - 2 * x) * x * x;
            const fy = (3 - 2 * y) * y * y;
            const p0 = this.p[X] + Y;
            const p1 = this.p[X + 1] + Y;

            return this.lerp(
                fy,
                this.lerp(
                    fx,
                    this.grad2d(this.p[p0], x, y),
                    this.grad2d(this.p[p1], x - 1, y)
                ),
                this.lerp(
                    fx,
                    this.grad2d(this.p[p0 + 1], x, y - 1),
                    this.grad2d(this.p[p1 + 1], x - 1, y - 1)
                )
            );
        }

        noise(x, y) {
            let e = 1;
            let k = 1;
            let s = 0;

            for (let i = 0; i < this.octaves; ++i) {
                e *= 0.5;
                s += (e * (1 + this.noise2d(k * x, k * y))) / 2;
                k *= 2;
            }

            return s;
        }
    }

    // Particles
    class Particle {
        constructor(x, y, a) {
            this.x = x;
            this.y = y;
            this.a = a;
        }

        move({ color, movement }) {
            const noise = perlin.noise(this.x * movement, this.y * 0.01)
            const n = movement * noise
            const a = this.a + n * movementA;

            this.x += Math.cos(a);
            this.y += Math.sin(a);

            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, 0.75, 0.75);

            if (
                this.x < 0 ||
                this.x > canvas.width ||
                this.y < 0 ||
                this.y > canvas.height
            ) {
                particles.delete(this);
            }
        }
    }

    // init canvas
    const canvas = {
        init() {
            this.elem = document.createElement("canvas");
            this.elem.setAttribute('id', `idx-${idx+1}`)

            document.querySelector('.container').appendChild(this.elem);
            this.resize();
            return this.elem.getContext("2d");
        },
        resize() {
            this.width = this.elem.width = this.elem.offsetWidth;
            this.height = this.elem.height = this.elem.offsetHeight;
        },
        reset() {
            this.resize();
            ctx.fillStyle = FILL;
        }
    };

    // init pointer
    const pointer = {
        init(canvas) {
            this.x = canvas.width * 0.5;
            this.y = canvas.height * 0.5;

            // ["mousedown", "touchstart"].forEach((event, touch) => {
            //     document.addEventListener(
            //         event,
            //         (e) => {
            //             if (touch) {
            //                 e.preventDefault();
            //                 this.x = e.targetTouches[0].clientX;
            //                 this.y = e.targetTouches[0].clientY;
            //             } else {
            //                 this.x = e.clientX;
            //                 this.y = e.clientY;
            //             }
            //             init();
            //         },
            //         false
            //     );
            // });
        }
    };

    // init pen
    const ctx = canvas.init();

    pointer.init(canvas);

    const perlin = new Noise(10);
    const particles = new Set();

    // start new
    const init = () => {
        let streamIdx = 0;

        if (doReset) {
            particles.clear();
            canvas.reset();
        }

        perlin.init();

        const end = 2 * Math.PI;

        for (let a = 0; a < end; a += Math.PI / 720) {
            // 'SISIUD'
            particles.add(new Particle(pointer.x, pointer.y, a));
            streamIdx++
        }
    };

    // move and draw particles
    const run = () => {
        requestAnimationFrame(run);

        for (const p of particles) {
            // p.move({ color: 'red', movement: 1 });
            p.move({ color: GRAD_1, movement: 2 });
            // p.move({ color: GRAD_2, movement: 3 });
            // p.move({ color: GRAD_3, movement: 4 });
        }
    };

    init()
    run()
}

for (let i = 0; i < numOfObjects; i++) {
    MakeItHappen(i)
}

// Based on the algo
// http://mrl.nyu.edu/~perlin/noise/

// creates grad pattern for fillStyle.
const createGradient = () => {
    const gradient = ctx.createLinearGradient(0, 10, 10, 0);

    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, GRAD_2);
    gradient.addColorStop(1.0, GRAD_3);

    return gradient;
}
