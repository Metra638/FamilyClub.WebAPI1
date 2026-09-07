

export default function FormatBadge({ icon, icon1, label }: { icon: string; icon1: string; label: string }) {
    return (
        <div className="group flex items-center overflow-hidden transition-all duration-300 w-[32px] hover:w-auto h-[32px] cursor-default">
            {/*іконка прихована при hover */}
            <img
                src={icon}
                className="w-[32px] h-[32px] flex-shrink-0 group-hover:hidden"
            />
            {/* показується при hover */}
            <div className="relative hidden group-hover:flex items-center -ml-1 flex-shrink-0">
                <img src={icon1} className="h-[32px]" />
                <span className="absolute left-8 text-white text-xs whitespace-nowrap">
                    {label}
                </span>
            </div>
        </div>
    );
}