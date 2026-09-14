import { cn } from '@/utils/classNames'

interface IconProps {
    icon: string
    className?: string
}

const Icon = ({ icon, className }: IconProps) => {
    return (
        <span
            className={cn("size-5 shrink-0 bg-black", className)}
            style={{
                WebkitMaskImage: `url(${icon})`,
                maskImage: `url(${icon})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "center",
                maskPosition: "center",
            }}
        />
    )
}

export default Icon