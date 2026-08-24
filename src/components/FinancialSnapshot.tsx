import "./FinancialSnapshot.css";

interface Product {
    category: string;
    title: string;
    description: string;
    action: string;
}

const products: Product[] = [
    {
        category: "EVERYDAY BANKING",
        title: "Capital Current",
        description:
            "A straightforward everyday account for spending, saving, and managing your money with confidence.",
        action: "View account",
    },
    {
        category: "SAVINGS",
        title: "Capital Savings",
        description:
            "Put your money to work while keeping it accessible when you need it.",
        action: "Explore savings",
    },
];

function FinancialSnapshot() {
    return (
        <section className="financial-snapshot">

            <div className="snapshot-container">

                <div className="snapshot-header">

                    <div>
                        <p className="snapshot-label">
                            BANKING PRODUCTS
                        </p>

                        <h2>
                            Money tools
                            <span>made simpler.</span>
                        </h2>
                    </div>

                    <p className="snapshot-intro">
                        The essentials you need to manage
                        your money today and build toward
                        tomorrow.
                    </p>

                </div>


                <div className="products-layout">

                    <article className="featured-product">

                        <div className="featured-top">

                            <span>
                                FEATURED
                            </span>

                            <span>
                                01 / 03
                            </span>

                        </div>


                        <div className="featured-content">

                            <p>
                                PREMIUM EVERYDAY BANKING
                            </p>

                            <h3>
                                Capital
                                <span>Signature.</span>
                            </h3>

                            <div className="signature-line"></div>

                            <p className="featured-description">
                                A premium banking experience
                                designed for people who expect
                                more from their everyday finances.
                            </p>

                            <a href="#">
                                Discover Signature
                                <span>→</span>
                            </a>

                        </div>


                        <div className="featured-number">
                            C
                        </div>

                    </article>


                    <div className="supporting-products">

                        {products.map((product) => (
                            <article
                                className="product-row"
                                key={product.title}
                            >

                                <div className="product-category">
                                    {product.category}
                                </div>

                                <div className="product-main">

                                    <h3>
                                        {product.title}
                                    </h3>

                                    <p>
                                        {product.description}
                                    </p>

                                    <a href="#">
                                        {product.action}
                                        <span>↗</span>
                                    </a>

                                </div>

                            </article>
                        ))}

                    </div>

                </div>

            </div>

        </section>
    );
}

export default FinancialSnapshot;