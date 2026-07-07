class ImageQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(url) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { url, resolve, reject } = this.queue.shift();
      try {
        const response = await fetch(url);
        if (!response.ok) {
           reject(new Error(`HTTP error! status: ${response.status}`));
           continue;
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        resolve(objectUrl);
      } catch (error) {
        reject(error);
      }
      
      // Delay before next request to respect rate limits (e.g. 1 second)
      await new Promise(r => setTimeout(r, 1000));
    }
    
    this.isProcessing = false;
  }
}

export const imageQueue = new ImageQueue();
