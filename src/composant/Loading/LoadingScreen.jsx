const LoadingScreen = ({ isFadingOut }) => (
    <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        zIndex: 1000,
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: 'none' // empêche clics pendant fade
    }}>
        <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #b85c9e',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
        }} />
        <h2 style={{ color: '#b85c9e' }}>Chargement en cours...</h2>

        <style>
            {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}
        </style>
    </div>
);

export default LoadingScreen;