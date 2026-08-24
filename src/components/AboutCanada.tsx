import "./AboutCanada.css";

function AboutCanada() {
    return (
        <section className="about-canada">

            <div className="canada-container">

                <div className="canada-visual">

                    <div className="canada-mark">
                        C
                    </div>

                    <div className="canada-location">
                        <span>BASED IN</span>
                        <strong>CANADA</strong>
                    </div>

                    <div className="canada-lines">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div className="canada-coordinate">
                        43° 39′ N
                        <br />
                        79° 23′ W
                    </div>

                </div>


                <div className="canada-content">

                    <p className="canada-label">
                        ABOUT CAPITAL BANK
                    </p>

                    <h2>
                        Canadian
                        <span>at heart.</span>
                    </h2>

                    <p className="canada-lead">
                        We believe banking should reflect the
                        people it serves — practical, ambitious,
                        dependable, and always looking forward.
                    </p>

                    <p className="canada-description">
                        Capital Bank of Canada is built around a
                        simple idea: give people and businesses
                        the financial tools, guidance, and confidence
                        to move forward.
                    </p>

                    <a
                        href="#about"
                        className="canada-link"
                    >
                        Discover our story
                        <span>→</span>
                    </a>

                </div>

            </div>


            <div className="canada-bottom">

                <span>
                    PROUDLY CANADIAN
                </span>

                <span>
                    PEOPLE • PURPOSE • PROGRESS
                </span>

                <span>
                    EST. 2026
                </span>

            </div>

        </section>
    );
}

export default AboutCanada;