/**
 * Stats Section
 * Key metrics and achievements display
 */

const StatsSection = () => {
    // Stats data
    const stats = [
        {
            value: '10M+',
            label: 'Images generated',
            description: 'and counting',
        },
        {
            value: '50K+',
            label: 'Happy customers',
            description: 'worldwide',
        },
        {
            value: '99.9%',
            label: 'Uptime',
            description: 'reliability',
        },
        {
            value: '<3s',
            label: 'Average processing',
            description: 'time',
        },
    ];

    return (
        <section className="py-16 md:py-24 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-2">
                                {stat.value}
                            </div>
                            <div className="text-gray-900 font-medium">{stat.label}</div>
                            <div className="text-gray-500 text-sm">{stat.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
