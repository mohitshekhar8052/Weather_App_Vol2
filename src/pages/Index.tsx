
import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { PartyPopper, Goal, Laptop } from 'lucide-react';

const slides = [
  {
    icon: PartyPopper,
    title: 'Welcome to Goldfish!',
    description: 'Goldfish was created to instill a more fun and engaging work culture.',
  },
  {
    icon: Goal,
    title: 'Achieve Your Goals',
    description: 'Get rewarded with coins for reaching your sales goals, taking a daily quiz, or just showing up on time for work.',
  },
  {
    icon: Laptop,
    title: 'Treat Yourself',
    description: 'Cash in those hard earned coins for real world rewards like gift cards or even a laptop.',
  },
];

const Index = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 md:p-8 relative overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent blur-3xl pointer-events-none -z-10"></div>
      
      <div className="h-10 flex items-center justify-end">
        {selectedIndex < slides.length - 1 && (
            <Button variant="ghost" className="text-muted-foreground font-semibold">
              Skip
            </Button>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {slides.map((slide, index) => (
              <div className="embla__slide flex flex-col items-center justify-center text-center" key={index}>
                <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center mb-10">
                  <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center">
                    <slide.icon className="w-24 h-24 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">{slide.title}</h2>
                <p className="text-lg text-muted-foreground max-w-sm">{slide.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6 pb-4">
        <div className="flex gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedIndex === index ? 'bg-primary scale-125 w-6' : 'bg-muted-foreground/30'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {selectedIndex === slides.length - 1 && (
          <Button className="btn-gradient w-full max-w-sm py-3 h-auto text-lg rounded-full">
            Sign In
          </Button>
        )}
        <div className="h-10"></div>
      </div>
    </div>
  );
};

export default Index;
