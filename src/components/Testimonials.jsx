import "./Testimonials.css";

const TEST = [
  {
    t: "Alex's 3D modeling completely transformed our product visuals. The detail and realism exceeded every expectation.",
    n: "Dr. Eugenia E.",
    r: "Medtech Visuals",
  },
  {
    t: "Working with Alex was seamless. The animations brought our brand story to life in a way we never imagined.",
    n: "Michael T.",
    r: "Forwardpath Innovations",
  },
  {
    t: "Alex's 3D character work added so much personality. Responsiveness and quality were outstanding.",
    n: "David R.",
    r: "Apex Interactive",
  },
  {
    t: "Incredible attention to detail. The renders looked so real our clients thought they were photographs.",
    n: "Sarah K.",
    r: "Lumen Studio",
  },
  {
    t: "The product design renders helped us secure funding. Alex understood exactly what we needed.",
    n: "Dr. Susana V.",
    r: "Medtech Visuals",
  },
  {
    t: "The 3D prototypes Alex created were pixel-perfect for pitching. Precision and care in every detail.",
    n: "James R.",
    r: "Innovatepro Design",
  },
  {
    t: "Fast, communicative, and wildly talented. Our launch visuals were absolutely unforgettable.",
    n: "Olivia M.",
    r: "Northwind Creative",
  },
  {
    t: "The 3D render Alex produced for our campaign added a dynamic edge. The results were beyond impressive.",
    n: "Daniel P.",
    r: "Bright Studio",
  },
  {
    t: "A true craftsman. Every revision improved the work and the final delivery blew us away.",
    n: "Priya N.",
    r: "Form & Function",
  },
];

export default function Testimonials() {
  const cols = [[], [], []];
  TEST.forEach((t, i) => cols[i % 3].push(t));

  return (
    <section className="testi" id="testimonials">
      <div className="wrap">
        <h2 className="display chrome reveal">
          What Clients
          <br />
          Are Saying <span className="emo">🤩</span>
        </h2>
        <div className="tcols">
          {cols.map((col, ci) => (
            <div className={`tcol${ci === 1 ? " mid" : ""}`} key={ci}>
              {col.map((t, i) => {
                const hue = (ci * 97 + i * 53) % 360;
                return (
                  <div
                    className="tcard reveal"
                    key={t.n}
                    style={{ transitionDelay: `${i * 0.07 + ci * 0.05}s` }}
                  >
                    <p>{t.t}</p>
                    <div className="who">
                      <div
                        className="av"
                        style={{
                          background: `linear-gradient(135deg,hsl(${hue},45%,60%),hsl(${(hue + 40) % 360},45%,40%))`,
                        }}
                      ></div>
                      <div>
                        <div className="nm">{t.n}</div>
                        <div className="ro">{t.r}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
