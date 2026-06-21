import Image from 'next/image';

type AppLogoProps = {
  theme?: 'dark' | 'light';
  className?: string;
  imageClassName?: string;
};

export function AppLogo({
  theme = 'dark',
  className = '',
  imageClassName = '',
}: AppLogoProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={
          theme === 'dark'
            ? '/brand/gmao-bmt-logo-dark.png'
            : '/brand/gmao-bmt-logo-light.png'
        }
        alt="GMAO BMT - Maintenance portuaire assistée"
        fill
        priority
        sizes="300px"
        className={`object-contain object-center ${imageClassName}`}
      />
    </div>
  );
}