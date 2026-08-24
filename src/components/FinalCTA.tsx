import "./FinalCTA.css";
import { Link } from "react-router-dom";

function FinalCTA() {
    return (
        <section className="final-cta">

            <div className="cta-container">

                <p className="cta-label">
                    READY WHEN YOU ARE
                </p>

                <h2>
                    Your next
                    <span>chapter starts here.</span>
                </h2>

                <p className="cta-description">
                    Whether you're opening your first account,
                    growing a business, or planning what's next,
                    Capital Bank is here to help you move forward.
                </p>

                <div className="cta-actions">

                    <Link
    to="/register"
    className="cta-primary"
>
    Open an account
    <span>→</span>
</Link>

<a
    href="#contact"
    className="cta-secondary"
>
    Talk to us
</a>

                </div>

            </div>


            <div className="cta-mark">
                CAPITAL
            </div>

        </section>
    );
}

export default FinalCTA;