document.addEventListener("DOMContentLoaded", function () {
  var splide = new Splide(".image-carousels", {
    pagination: true,
    arrows: false,
    easing: "ease-out",
    drag: true,
    perPage: 1,
    perMove: 1,
  });
  splide.mount();

  const canvas = document.getElementById("scratchCanvas");
  const ctx = canvas.getContext("2d");
  const video = document.getElementById("videoElement");
  const rect = canvas.getBoundingClientRect();

  // Set up the canvas mask
  canvas.width = 600;
  canvas.height = 300;

  // Fill the canvas with black to act as a solid mask
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Function to update the mask applied to the video
  function updateMask() {
    const maskURL = canvas.toDataURL();
    video.style.webkitMaskImage = `url(${maskURL})`;
    video.style.maskImage = `url(${maskURL})`;
  }

  // Function to create a random scratch
  function createScratch(x, y, radius) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    updateMask();
  }

  // Random scratch animation
  function randomScratches(callback) {
    let scratchCount = 0;
    const scratchInterval = setInterval(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const maxRadius = Math.random() * 30 + 10; // Random max radius between 10 and 40
      const progress = { radius: 0 };

      gsap.to(progress, {
        radius: maxRadius,
        duration: 0.5, // Easing duration for each scratch
        ease: "power2.out", // Smooth easing effect
        onUpdate: () => {
          createScratch(x, y, progress.radius);
        },
      });

      scratchCount++;
      if (scratchCount >= 10) {
        clearInterval(scratchInterval);
        if (callback) callback();
      }
    }, 50); // Scratch every 50ms
  }

  // Reset the canvas back to the initial state with animation
  function resetCanvas(callback) {
    const progress = { alpha: 0 };

    gsap.to(progress, {
      alpha: 1,
      duration: 0.5, // Adjust the duration as needed
      ease: "power2.inOut", // Adds easing for a smoother effect
      onUpdate: () => {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = `rgba(0, 0, 0, ${progress.alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateMask(); // Update the mask if needed
      },
      onComplete: callback,
    });
    // Default cursor state
    video.style.cursor = "grab";
  }

  // Enable full scratch functionality (mobile and desktop)
  function enableFullScratch() {
    let isScratching = false;

    // Get the bounding rect of the video for proper touch/mouse positioning
    const rect = video.getBoundingClientRect();

    // Start scratching
    const startScratching = () => {
      isScratching = true;
      video.style.cursor = "grabbing"; // Change to grabbing
    };

    // Stop scratching
    const stopScratching = () => {
      isScratching = false;
      checkScratchCompletion();
      video.style.cursor = "grab"; // Change to grabbing
    };

    // Scratch logic
    const scratch = (x, y) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Update the mask applied to the video
      updateMask();
    };

    // Mouse events
    video.addEventListener("mousedown", startScratching);
    window.addEventListener("mouseup", stopScratching);
    video.addEventListener("mousemove", (e) => {
      if (!isScratching) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      scratch(x, y);
    });

    // Mobile touch events
    video.addEventListener("touchstart", (e) => {
      e.preventDefault(); // Prevent scrolling
      startScratching();
    });

    video.addEventListener("touchend", (e) => {
      e.preventDefault();
      stopScratching();
    });

    video.addEventListener("touchmove", (e) => {
      if (!isScratching) return;
      e.preventDefault();

      const touch = e.touches[0]; // Get the first touch point
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      scratch(x, y);
    });

    // For instant scratch completion on click/tap
    video.addEventListener("click", () => {
      console.log("aaa");
      checkScratchCompletion();
    });
  }

  // Check if enough of the video has been scratched
  function checkScratchCompletion() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let scratchedPixels = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) {
        scratchedPixels++;
      }
    }
    gsap.to(video, {
      opacity: 0,
      duration: 1,
      onComplete: function () {
        gsap.set(video, { display: "none" });
      },
    });
    gsap.to(document.getElementById("hiddenImage"), {
      opacity: 1,
      duration: 1,
    });
  }

  // Start the animation on page load
  window.onload = () => {
    randomScratches(() => {
      randomScratches(() => {
        resetCanvas(() => {
          enableFullScratch(); // Enable manual scratching after resetting the canvas
        });
      });
    });
  };

  // Initial mask setup
  updateMask();
});
