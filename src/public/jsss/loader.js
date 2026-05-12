function showLoader() {
    document.body.classList.add('loading');
    document.getElementById('fullscreen-loader').classList.remove('hidden');
  }
  
  function hideLoader() {
    document.body.classList.remove('loading');
    document.getElementById('fullscreen-loader').classList.add('hidden');
  }
  