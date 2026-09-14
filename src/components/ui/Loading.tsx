interface LoadingProps {
    size?: "sm" | "md" | "lg";
    message?: string;
    showMessage?: boolean;
}

const sizeMap = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-20 h-20 border-8",
};

const sizeFontMap = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
};

const Loading = ({
    size = "md",
    message = "Loading...",
    showMessage = true,
}: LoadingProps) => {
    // ========RETURN========
    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div
                className={`animate-spin border-t-primary rounded-full border-transparent border-t-4 border-solid ${sizeMap[size]}`}
            />

            {showMessage && (
                <p className={`mt-2 text-gray/80 ${sizeFontMap[size]}`}>{message}</p>
            )}
        </div>
    );
};

export default Loading;