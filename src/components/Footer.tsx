import "./Footer.css";

function Footer() {
    return (
        <footer className="site-footer">

            <div className="footer-main">

                <div className="footer-brand">

                    <a
                        href="/"
                        className="footer-logo"
                    >
                        CAPITAL
                        <span>BANK OF CANADA</span>
                    </a>

                    <p>
                        Banking built around
                        people, purpose, and progress.
                    </p>

                </div>


                <div className="footer-column">

                    <h3>
                        PERSONAL
                    </h3>

                    <a href="#accounts">
                        Accounts
                    </a>

                    <a href="#cards">
                        Credit Cards
                    </a>

                    <a href="#loans">
                        Loans
                    </a>

                    <a href="#mortgages">
                        Mortgages
                    </a>

                    <a href="#investing">
                        Investing
                    </a>

                </div>


                <div className="footer-column">

                    <h3>
                        BUSINESS
                    </h3>

                    <a href="#business-banking">
                        Business Banking
                    </a>

                    <a href="#business-loans">
                        Business Loans
                    </a>

                    <a href="#commercial">
                        Commercial Banking
                    </a>

                    <a href="#merchant">
                        Merchant Services
                    </a>

                </div>


                <div className="footer-column">

                    <h3>
                        CAPITAL
                    </h3>

                    <a href="#about">
                        About Us
                    </a>

                    <a href="#careers">
                        Careers
                    </a>

                    <a href="#security">
                        Security
                    </a>

                    <a href="#contact">
                        Contact
                    </a>

                    <a href="#locations">
                        Locations
                    </a>

                </div>

            </div>


            <div className="footer-bottom">

                <span>
                    © 2026 Capital Bank of Canada
                </span>

                <div className="footer-legal">

                    <a href="#privacy">
                        Privacy
                    </a>

                    <a href="#legal">
                        Legal
                    </a>

                    <a href="#accessibility">
                        Accessibility
                    </a>

                </div>

                <span className="footer-country">
                    CANADA
                </span>

            </div>

        </footer>
    );
}

export default Footer;