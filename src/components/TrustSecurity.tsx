import "./TrustSecurity.css";

interface SecurityFeature {
    number: string;
    title: string;
    description: string;
}

const securityFeatures: SecurityFeature[] = [
    {
        number: "01",
        title: "Secure by design",
        description:
            "Your accounts and personal information are protected with modern security technology.",
    },
    {
        number: "02",
        title: "Always connected",
        description:
            "Monitor your accounts and stay in control through secure digital banking.",
    },
    {
        number: "03",
        title: "Here when you need us",
        description:
            "Get support when something doesn't look right or when you simply need a hand.",
    },
];

function TrustSecurity() {
    return (
        <section className="trust-security">

            <div className="trust-container">

                <div className="trust-heading">

                    <p className="trust-label">
                        SECURITY & TRUST
                    </p>

                    <h2>
                        Your money
                        <span>deserves certainty.</span>
                    </h2>

                    <p className="trust-description">
                        Banking should give you confidence, not
                        another reason to worry. We build security
                        into every part of the Capital Bank experience.
                    </p>

                    <a
                        href="#security"
                        className="trust-link"
                    >
                        Learn about our security
                        <span>↗</span>
                    </a>

                </div>


                <div className="trust-features">

                    {securityFeatures.map((feature) => (
                        <article
                            className="trust-feature"
                            key={feature.number}
                        >

                            <span className="trust-number">
                                {feature.number}
                            </span>

                            <div>

                                <h3>
                                    {feature.title}
                                </h3>

                                <p>
                                    {feature.description}
                                </p>

                            </div>

                        </article>
                    ))}

                </div>

            </div>


            <div className="trust-bottom">

                <div>
                    <strong>
                        24/7
                    </strong>

                    <span>
                        DIGITAL ACCESS
                    </span>
                </div>

                <div>
                    <strong>
                        100%
                    </strong>

                    <span>
                        CANADIAN FOCUS
                    </span>
                </div>

                <div>
                    <strong>
                        01
                    </strong>

                    <span>
                        SIMPLE PROMISE
                    </span>
                </div>

            </div>

        </section>
    );
}

export default TrustSecurity;