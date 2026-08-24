import "./CapitalDifference.css";

const differences = [
    {
        number: "01",
        title: "Human when it matters.",
        text: "Real people, thoughtful advice, and support that goes beyond automated answers.",
    },
    {
        number: "02",
        title: "Digital by design.",
        text: "Simple, secure technology that lets you manage your finances wherever you are.",
    },
    {
        number: "03",
        title: "Built for Canada.",
        text: "A Canadian banking experience designed around Canadian people, businesses, and ambitions.",
    },
];

function CapitalDifference() {
    return (
        <section className="capital-difference">

            <div className="difference-container">

                <div className="difference-heading">

                    <p className="difference-label">
                        THE CAPITAL DIFFERENCE
                    </p>

                    <h2>
                        More than a bank.
                        <span>A better way forward.</span>
                    </h2>

                </div>


                <div className="difference-intro">

                    <p>
                        Banking should make life clearer,
                        not more complicated. That's why
                        everything we build starts with one
                        simple question:
                    </p>

                    <strong>
                        "How can we make this better?"
                    </strong>

                </div>


                <div className="difference-grid">

                    {differences.map((item) => (
                        <article
                            className="difference-item"
                            key={item.number}
                        >

                            <span className="difference-number">
                                {item.number}
                            </span>

                            <h3>
                                {item.title}
                            </h3>

                            <p>
                                {item.text}
                            </p>

                        </article>
                    ))}

                </div>

            </div>

        </section>
    );
}

export default CapitalDifference;