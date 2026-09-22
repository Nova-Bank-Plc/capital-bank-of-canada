import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowDownLeft,
    ArrowUpRight,
    Coins,
    ExternalLink,
    RefreshCw,
    Wallet,
} from "lucide-react";

import {
    Link,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

import {
    useTheme,
} from "../context/ThemeContext";

import "./Investments.css";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (
        import.meta.env.PROD
            ? ""
            : "http://localhost:5000"
    );


// ======================================
// TYPES
// ======================================

interface DigitalAsset {
    id: string;
    asset: string;
    symbol: string;
    balance: number;
    cadValue: number;
    rate: number;
}

interface DigitalAssetTransaction {
    id: string;
    asset: string;
    symbol: string;
    type: "credit" | "debit" | "conversion";
    quantity: number;
    reference: string;
    status: string;
    createdAt: string;
}

interface InvestmentsResponse {
    success: boolean;
    data: {
        assets: DigitalAsset[];
        transactions: DigitalAssetTransaction[];
        totalValue: number;
    };
}


// ======================================
// ASSET DISPLAY HELPERS
// ======================================

const assetDescriptions: Record<string, string> = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    SOL: "Solana",
    XRP: "XRP",
    CBC: "Capital Coin",
};


const assetSymbols = [
    "BTC",
    "ETH",
    "SOL",
    "XRP",
    "CBC",
];


const formatNumber = (
    value: number,
    maximumFractionDigits = 8,
) => {
    return new Intl.NumberFormat(
        "en-CA",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits,
        },
    ).format(value);
};


const formatCurrency = (
    value: number,
) => {
    return new Intl.NumberFormat(
        "en-CA",
        {
            style: "currency",
            currency: "CAD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    ).format(value);
};


const formatDate = (
    date: string,
) => {
    return new Date(date).toLocaleDateString(
        "en-CA",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    );
};


const getAssetName = (
    symbol: string,
) => {
    return assetDescriptions[symbol] || symbol;
};


// ======================================
// COMPONENT
// ======================================

const Investments = () => {

    const {
        token,
    } = useAuth();

    const {
        darkMode,
    } = useTheme();


    const [
        assets,
        setAssets,
    ] = useState<DigitalAsset[]>([]);


    const [
        transactions,
        setTransactions,
    ] = useState<DigitalAssetTransaction[]>([]);


    const [
        totalValue,
        setTotalValue,
    ] = useState(0);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        selectedAsset,
        setSelectedAsset,
    ] = useState("BTC");


    const [
        conversionAmount,
        setConversionAmount,
    ] = useState("");


    const [
        conversionDirection,
        setConversionDirection,
    ] = useState<"toAsset" | "toCad">(
        "toAsset",
    );


    const [
        conversionMessage,
        setConversionMessage,
    ] = useState("");


    const [
        converting,
        setConverting,
    ] = useState(false);


    // ======================================
    // FETCH INVESTMENT DATA
    // ======================================

    const fetchInvestments = async (
        showRefresh = false,
    ) => {

        if (!token) {
            return;
        }


        try {

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }


            setError("");


            const response = await fetch(
                `${API_BASE_URL}/api/digital-assets`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );


            if (!response.ok) {
                throw new Error(
                    "Unable to load your digital assets.",
                );
            }


            const result: InvestmentsResponse =
                await response.json();


            if (!result.success) {
                throw new Error(
                    "Unable to load your digital assets.",
                );
            }


            setAssets(
                result.data.assets || [],
            );


            setTransactions(
                result.data.transactions || [],
            );


            setTotalValue(
                result.data.totalValue || 0,
            );

        } catch (requestError) {

            console.error(
                "Investments error:",
                requestError,
            );


            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to load your investments.",
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {

        fetchInvestments();

    }, [token]);


    // ======================================
    // ASSET MAP
    // ======================================

    const assetMap = useMemo(() => {

        const map: Record<
            string,
            DigitalAsset
        > = {};


        assets.forEach(
            (asset) => {
                map[asset.symbol] = asset;
            },
        );


        return map;

    }, [assets]);


    // ======================================
    // SELECTED ASSET
    // ======================================

    const selectedAssetData =
        assetMap[selectedAsset];


    // ======================================
    // CONVERSION ESTIMATE
    // ======================================

    const conversionEstimate = useMemo(() => {

        const amount =
            Number(conversionAmount);


        if (
            !amount ||
            amount <= 0 ||
            !selectedAssetData
        ) {
            return 0;
        }


        if (
            conversionDirection ===
            "toAsset"
        ) {

            if (
                !selectedAssetData.rate ||
                selectedAssetData.rate <= 0
            ) {
                return 0;
            }


            return amount /
                selectedAssetData.rate;
        }


        return amount *
            selectedAssetData.rate;

    }, [
        conversionAmount,
        conversionDirection,
        selectedAssetData,
    ]);


    // ======================================
    // CONVERSION
    // ======================================

    const handleConversion = async () => {

        if (!token) {
            return;
        }


        const amount =
            Number(conversionAmount);


        if (
            !amount ||
            amount <= 0
        ) {

            setConversionMessage(
                "Enter a valid conversion amount.",
            );

            return;
        }


        if (!selectedAssetData) {

            setConversionMessage(
                "Select an asset first.",
            );

            return;
        }


        try {

            setConverting(true);
            setConversionMessage("");


            const response = await fetch(
                `${API_BASE_URL}/api/digital-assets/convert`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        asset: selectedAsset,
                        direction:
                            conversionDirection,
                        amount,
                    }),
                },
            );


            const result =
                await response.json();


            if (!response.ok || !result.success) {

                throw new Error(
                    result.message ||
                    "Conversion could not be completed.",
                );
            }


            setConversionAmount("");


            setConversionMessage(
                "Conversion completed successfully.",
            );


            await fetchInvestments(true);

        } catch (requestError) {

            setConversionMessage(
                requestError instanceof Error
                    ? requestError.message
                    : "Conversion could not be completed.",
            );

        } finally {

            setConverting(false);
        }
    };


    // ======================================
    // LOADING
    // ======================================

    if (loading) {

        return (
            <div
                className={`investments-page ${
                    darkMode
                        ? "dark-mode"
                        : ""
                }`}
            >

                <div className="investments-loading">

                    <div className="investments-spinner">
                        <RefreshCw
                            size={24}
                        />
                    </div>

                    <p>
                        Loading your digital assets...
                    </p>

                </div>

            </div>
        );
    }


    // ======================================
    // PAGE
    // ======================================

    return (

        <div
            className={`investments-page ${
                darkMode
                    ? "dark-mode"
                    : ""
            }`}
        >

            {/* ==================================
                HEADER
            ================================== */}

            <header className="investments-header">

                <div>

                    <Link
                        to="/dashboard"
                        className="investments-back-link"
                    >
                        ← Back to Dashboard
                    </Link>

                    <div className="investments-title-row">

                        <div className="investments-title-icon">
                            <Coins size={25} />
                        </div>

                        <div>

                            <h1>
                                Digital Assets
                            </h1>

                            <p>
                                Manage your digital asset portfolio.
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    className="investments-refresh-button"
                    onClick={() =>
                        fetchInvestments(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "spinning"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"
                    }

                </button>

            </header>


            {/* ==================================
                ERROR
            ================================== */}

            {error && (

                <div className="investments-error">

                    <strong>
                        Digital assets unavailable
                    </strong>

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            fetchInvestments(true)
                        }
                    >
                        Try again
                    </button>

                </div>

            )}


            {/* ==================================
                PORTFOLIO SUMMARY
            ================================== */}

            <section className="investments-summary">

                <div className="investments-summary-content">

                    <div>

                        <span className="investments-summary-label">
                            Total portfolio value
                        </span>

                        <h2>
                            {formatCurrency(
                                totalValue,
                            )}
                        </h2>

                        <span className="investments-summary-caption">
                            Estimated value in Canadian dollars
                        </span>

                    </div>


                    <div className="investments-wallet-icon">
                        <Wallet size={32} />
                    </div>

                </div>

            </section>


            {/* ==================================
                ASSETS
            ================================== */}

            <section className="investments-section">

                <div className="investments-section-heading">

                    <div>

                        <h2>
                            Your digital assets
                        </h2>

                        <p>
                            Your current balances across supported assets.
                        </p>

                    </div>

                </div>


                <div className="investments-assets-grid">

                    {assetSymbols.map(
                        (symbol) => {

                            const asset =
                                assetMap[symbol];


                            const balance =
                                asset?.balance || 0;


                            const cadValue =
                                asset?.cadValue || 0;


                            return (

                                <article
                                    key={symbol}
                                    className="investment-asset-card"
                                >

                                    <div className="investment-asset-top">

                                        <div className="investment-asset-symbol">
                                            {symbol}
                                        </div>

                                        <span className="investment-asset-name">
                                            {getAssetName(
                                                symbol,
                                            )}
                                        </span>

                                    </div>


                                    <div className="investment-asset-balance">

                                        <span>
                                            Balance
                                        </span>

                                        <strong>
                                            {formatNumber(
                                                balance,
                                            )}{" "}
                                            {symbol}
                                        </strong>

                                    </div>


                                    <div className="investment-asset-value">

                                        <span>
                                            Estimated value
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                cadValue,
                                            )}
                                        </strong>

                                    </div>


                                    <div className="investment-asset-rate">

                                        <span>
                                            Conversion rate
                                        </span>

                                        <strong>
                                            {asset?.rate
                                                ? `${formatCurrency(
                                                    asset.rate,
                                                )} / ${symbol}`
                                                : "Rate unavailable"
                                            }
                                        </strong>

                                    </div>

                                </article>

                            );

                        },
                    )}

                </div>

            </section>


            {/* ==================================
                CONVERSION
            ================================== */}

            <section className="investments-section">

                <div className="investments-section-heading">

                    <div>

                        <h2>
                            Convert currency
                        </h2>

                        <p>
                            Convert between your CAD balance and supported digital assets.
                        </p>

                    </div>

                </div>


                <div className="investments-conversion-card">

                    <div className="conversion-direction">

                        <button
                            type="button"
                            className={
                                conversionDirection ===
                                "toAsset"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => {
                                setConversionDirection(
                                    "toAsset",
                                );
                                setConversionMessage("");
                            }}
                        >
                            CAD → Digital Asset
                        </button>


                        <button
                            type="button"
                            className={
                                conversionDirection ===
                                "toCad"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => {
                                setConversionDirection(
                                    "toCad",
                                );
                                setConversionMessage("");
                            }}
                        >
                            Digital Asset → CAD
                        </button>

                    </div>


                    <div className="conversion-form">

                        <div className="conversion-field">

                            <label htmlFor="conversion-asset">
                                Digital asset
                            </label>

                            <select
                                id="conversion-asset"
                                value={selectedAsset}
                                onChange={(event) => {
                                    setSelectedAsset(
                                        event.target.value,
                                    );
                                    setConversionMessage("");
                                }}
                            >

                                {assetSymbols.map(
                                    (symbol) => (
                                        <option
                                            key={symbol}
                                            value={symbol}
                                        >
                                            {getAssetName(
                                                symbol,
                                            )}{" "}
                                            ({symbol})
                                        </option>
                                    ),
                                )}

                            </select>

                        </div>


                        <div className="conversion-field">

                            <label htmlFor="conversion-amount">
                                Amount
                            </label>

                            <input
                                id="conversion-amount"
                                type="number"
                                min="0"
                                step="any"
                                value={conversionAmount}
                                onChange={(event) => {
                                    setConversionAmount(
                                        event.target.value,
                                    );
                                    setConversionMessage("");
                                }}
                                placeholder={
                                    conversionDirection ===
                                    "toAsset"
                                        ? "Enter CAD amount"
                                        : `Enter ${selectedAsset} amount`
                                }
                            />

                        </div>


                        <div className="conversion-estimate">

                            <span>
                                Estimated conversion
                            </span>

                            <strong>

                                {conversionDirection ===
                                "toAsset"

                                    ? `${formatNumber(
                                        conversionEstimate,
                                    )} ${selectedAsset}`

                                    : formatCurrency(
                                        conversionEstimate,
                                    )
                                }

                            </strong>

                        </div>


                        <button
                            type="button"
                            className="conversion-submit"
                            onClick={handleConversion}
                            disabled={converting}
                        >

                            {converting
                                ? "Processing..."
                                : "Review Conversion"
                            }

                        </button>


                        {conversionMessage && (

                            <p className="conversion-message">
                                {conversionMessage}
                            </p>

                        )}

                    </div>

                </div>

            </section>


            {/* ==================================
                TRANSACTION HISTORY
            ================================== */}

            <section className="investments-section">

                <div className="investments-section-heading">

                    <div>

                        <h2>
                            Asset activity
                        </h2>

                        <p>
                            Recent activity on your digital asset account.
                        </p>

                    </div>

                </div>


                <div className="asset-history-card">

                    {transactions.length === 0 ? (

                        <div className="asset-history-empty">

                            <Coins size={30} />

                            <h3>
                                No asset activity yet
                            </h3>

                            <p>
                                Your digital asset credits and conversions will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="asset-history-list">

                            {transactions.map(
                                (transaction) => (

                                    <div
                                        className="asset-history-item"
                                        key={transaction.id}
                                    >

                                        <div
                                            className={`asset-history-icon ${
                                                transaction.type ===
                                                "credit"
                                                    ? "credit"
                                                    : "debit"
                                            }`}
                                        >

                                            {transaction.type ===
                                            "credit"
                                                ? (
                                                    <ArrowDownLeft
                                                        size={18}
                                                    />
                                                )
                                                : (
                                                    <ArrowUpRight
                                                        size={18}
                                                    />
                                                )
                                            }

                                        </div>


                                        <div className="asset-history-main">

                                            <strong>
                                                {transaction.asset}
                                            </strong>

                                            <span>
                                                {transaction.reference ||
                                                    "Digital asset activity"}
                                            </span>

                                        </div>


                                        <div className="asset-history-amount">

                                            <strong>
                                                {transaction.type ===
                                                "credit"
                                                    ? "+"
                                                    : "-"
                                                }

                                                {formatNumber(
                                                    transaction.quantity,
                                                )}{" "}
                                                {transaction.symbol}
                                            </strong>

                                            <span>
                                                {formatDate(
                                                    transaction.createdAt,
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                ),
                            )}

                        </div>

                    )}

                </div>

            </section>


            {/* ==================================
                EXTERNAL EXCHANGE
            ================================== */}

            <section className="investments-exchange">

                <div className="investments-exchange-icon">
                    <ExternalLink size={25} />
                </div>


                <div className="investments-exchange-content">

                    <h2>
                        Coin Exchange
                    </h2>

                    <p>
                        Looking for expanded digital asset trading,
                        market tools, or a dedicated exchange application?
                        You can continue through our supported external
                        exchange partner.
                    </p>

                </div>


                <a
                    href="#"
                    className="investments-exchange-button"
                    onClick={(event) => {
                        event.preventDefault();
                        alert(
                            "The official exchange partner will be connected here.",
                        );
                    }}
                >
                    Visit Coin Exchange
                    <ExternalLink size={16} />
                </a>

            </section>

        </div>
    );
};


export default Investments;