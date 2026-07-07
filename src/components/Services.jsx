import "./Services.css";

const SRV = [
  {
    t: "Delivery & Project Management",
    d: "End-to-end coordination of parallel projects across Art, Dev and QA teams, using Agile/Scrum methodologies to keep delivery on track under limited resources.",
  },
  {
    t: "Cross-functional Team Leadership",
    d: "Bridging Product, Engineering and Community teams — translating business vision into executable requirements and keeping everyone aligned.",
  },
  {
    t: "AI & Process Automation",
    d: "Designing and deploying AI-driven tools (LLM-based support agents, automation workflows) that reduce manual workload and improve resolution times.",
  },
  {
    t: "Blockchain & Web3 Delivery",
    d: "Managing blockchain-based platforms and NFT/token systems end-to-end, from smart contract coordination to live product launches.",
  },
  {
    t: "Customer Support & Community Ops",
    d: "Building and running support infrastructure (Zendesk, Discord) and community programs that scale with the product.",
  },
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="wrap">
        <h2 className="display d-3d-dark reveal">HOW I DELIVER</h2>
        <p className="services-subhead reveal">What I Bring to a Team</p>
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
