self.onmessage = (e) => {   
    const filteredPoints = e.data.features.filter(features => {
      if (features.geometry.type === 'Point') {
        return features.geometry.coordinates[1] > 48.8534;
      }
      return false;
    });
    self.postMessage({ filteredPoints });
  };
