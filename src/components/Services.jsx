import "./Services.css";

const SRV = [
  {
    t: "3D Modeling",
    d: "Creation of detailed objects, characters, or environments tailored to specific client needs. Ideal for games, products, and visualizations.",
  },
  {
    t: "3D Rendering",
    d: "High-quality, photorealistic renders that showcase designs with realistic lighting, textures, and shadows.",
  },
  {
    t: "3D Animation",
    d: "Dynamic animations to bring characters, products, or environments to life for marketing, gaming, or storytelling.",
  },
  {
    t: "Product Design",
    d: "Precise 3D modeling and rendering for showcasing or prototyping consumer products.",
  },
  {
    t: "3D Printing Models",
    d: "Custom 3D designs prepared and optimized for 3D printing technology.",
  },
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="wrap">
        <h2 className="display d-3d-dark reveal">SERVICES</h2>
        <div>
          {SRV.map((s, i) => (
            <div
              className="srv reveal"
              key={s.t}
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="num">0{i + 1}</div>
              <div className="body">
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
