import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BankingOverview from "../components/BankingOverview";
import CapitalDifference from "../components/CapitalDifference";
import FinancialSnapshot from "../components/FinancialSnapshot";
import TrustSecurity from "../components/TrustSecurity";
import AboutCanada from "../components/AboutCanada";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import ScrollToTop from "../components/ScrollToTop";


function Home() {
    return (
        <>
            <Navbar />

            <main>

                <Hero />

                <ScrollReveal>
                    <BankingOverview />
                </ScrollReveal>

                <ScrollReveal>
                    <CapitalDifference />
                </ScrollReveal>

                <ScrollReveal>
                    <FinancialSnapshot />
                </ScrollReveal>

                <ScrollReveal>
                    <TrustSecurity />
                </ScrollReveal>

                <ScrollReveal>
                    <AboutCanada />
                </ScrollReveal>

                <ScrollReveal>
                    <FinalCTA />
                </ScrollReveal>

            </main>

            <Footer />

            <ScrollToTop />
        </>
    );
}

export default Home;