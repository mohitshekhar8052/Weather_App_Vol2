
import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { PartyPopper, Goal, Laptop } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
    <path fill="#4285F4" d="M17.64 9.2045c0-.6382-.0573-1.2518-.1645-1.8409H9v3.4818h4.8436c-.2086 1.125-.8441 2.0782-1.7959 2.7164v2.2582h2.9082c1.7018-1.5668 2.6864-3.8736 2.6864-6.6155z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8055 5.9564-2.1818l-2.9082-2.2582c-.8055.54-1.8368.8618-3.0482.8618-2.3441 0-4.3282-1.5877-5.0359-3.71H.9573v2.3318C2.4382 16.1423 5.4268 18 9 18z"/>
    <path fill="#FBBC05" d="M3.9641 10.71c-.1895-.54-.2982-1.1168-.2982-1.71s.1086-1.17.2982-1.71V4.9582H.9573C.3477 6.1718 0 7.5455 0 9s.3477 2.8282.9573 4.0418L3.9641 10.71z"/>
    <path fill="#EA4335" d="M9 3.5727c1.3214 0 2.5077.4545 3.4405 1.3418l2.5855-2.5855C13.4636.8836 11.4264 0 9 0 5.4268 0 2.4382 1.8577.9573 4.9582L3.9641 7.29C4.6718 5.1618 6.6559 3.5727 9 3.5727z"/>
  </svg>
);

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
      
      <div className="h-10" />

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
        <div className="flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedIndex === index ? 'bg-primary scale-150' : 'bg-muted-foreground/30'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="w-full max-w-sm">
          {selectedIndex === slides.length - 1 ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <Button variant="outline" className="bg-foreground text-background hover:bg-foreground/90 w-full py-3 h-auto text-lg rounded-full flex items-center justify-center gap-2 font-semibold border-0">
                <GoogleIcon className="h-5 w-5" />
                <span>Sign in with Google</span>
              </Button>
              <Button variant="ghost" className="w-full py-3 h-auto text-lg text-primary font-semibold rounded-full">
                Create account
              </Button>
            </div>
          ) : (
            <div className="h-[124px]" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
