import "./BankingOverview.css";

interface BankingOption {
    number: string;
    title: string;
    description: string;
    link: string;
    target: string;
}

const bankingOptions: BankingOption[] = [
    {
        number: "01",
        title: "Personal",
        description:
            "Everyday banking designed around the way you live, spend, save, and plan.",
        link: "Explore personal banking",
        target: "personal",
    },
    {
        number: "02",
        title: "Business",
        description:
            "Financial tools and support for businesses ready to build, grow, and move forward.",
        link: "Explore business banking",
        target: "business",
    },
    {
        number: "03",
        title: "Wealth",
        description:
            "Thoughtful wealth strategies for protecting what you've built and planning what's next.",
        link: "Explore wealth management",
        target: "wealth",
    },
];

function BankingOverview() {
    return (
        <section className="banking-overview">

            <div className="overview-container">

                <div className="overview-intro">

                    <p className="section-label">
                        HOW WE BANK
                    </p>

                    <h2>
                        Financial
                        <span>confidence</span>
                        starts here.
                    </h2>

                    <p className="overview-description">
                        Whether you're managing your first account,
                        growing a business, or planning the future,
                        Capital Bank brings clarity to every
                        financial decision.
                    </p>

                </div>


                <div className="banking-options">

                    {bankingOptions.map((option) => (
                        <a
                            href={`#${option.target}`}
                            id={option.target}
                            className="banking-option"
                            key={option.number}
                        >

                            <div className="option-top">

                                <span className="option-number">
                                    {option.number}
                                </span>

                                <span className="option-arrow">
                                    ↗
                                </span>

                            </div>


                            <div className="option-content">

                                <h3>
                                    {option.title}
                                </h3>

                                <p>
                                    {option.description}
                                </p>

                            </div>


                            <span className="option-link">
                                {option.link}
                            </span>

                        </a>
                    ))}

                </div>

            </div>

        </section>
    );
}

export default BankingOverview;