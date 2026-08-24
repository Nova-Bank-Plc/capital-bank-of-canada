import "./Hero.css";

function Hero() {
    return (
        <section className="modern-hero">

            <div className="hero-container">

                <div className="hero-content">

                    <p className="hero-label">
                        CAPITAL BANK OF CANADA
                    </p>

                    <h1>
                        Banking
                        <span>built</span>
                        differently.
                    </h1>

                    <p className="hero-description">
                        Modern financial solutions for
                        individuals, families, and businesses
                        moving Canada forward.
                    </p>

                    <div className="hero-actions">

                        <a
                            href="#personal"
                            className="hero-primary"
                        >
                            Explore banking
                            <span>→</span>
                        </a>

                        <a
                            href="#about"
                            className="hero-link"
                        >
                            Why Capital Bank
                            <span>↗</span>
                        </a>

                    </div>

                </div>


                <div className="hero-visual">

                    <div className="red-panel">

                        <div className="panel-number">
                            01
                        </div>

                        <div className="panel-content">

                            <span>
                                YOUR MONEY
                            </span>

                            <strong>
                                YOUR
                                <br />
                                DIRECTION.
                            </strong>

                        </div>

                        <div className="panel-bottom">
                            CAPITAL BANK
                            <span>CANADA</span>
                        </div>

                    </div>


                    <div className="floating-card">

                        <span>
                            CAPITAL BANK
                        </span>

                        <strong>
                            04 / 28
                        </strong>

                        <div className="card-line"></div>

                    </div>

                </div>

            </div>


            <div className="hero-bottom">

                <span>
                    PERSONAL BANKING
                </span>

                <span>
                    BUSINESS BANKING
                </span>

                <span>
                    WEALTH MANAGEMENT
                </span>

                <span className="hero-scroll">
                    SCROLL ↓
                </span>

            </div>

        </section>
    );
}

export default Hero;