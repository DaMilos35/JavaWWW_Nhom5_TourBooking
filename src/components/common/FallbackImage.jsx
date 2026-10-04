import React, { useEffect, useState } from 'react';
import tourPlaceholder from '../../assets/tour-placeholder.svg';

const FallbackImage = ({ src, alt = '', ...imageProps }) => {
  const [imageSource, setImageSource] = useState(src || tourPlaceholder);

  useEffect(() => {
    setImageSource(src || tourPlaceholder);
  }, [src]);

  const handleError = () => {
    if (imageSource !== tourPlaceholder) setImageSource(tourPlaceholder);
  };

  return <img {...imageProps} src={imageSource} alt={alt} onError={handleError} />;
};

export default FallbackImage;
