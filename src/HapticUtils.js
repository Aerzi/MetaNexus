// HapticUtils.js
export const triggerHaptic = (type) => {
  if (!navigator.vibrate) return;

  switch (type) {
    case 'tap':
      navigator.vibrate(10);
      break;
    case 'clack':
      navigator.vibrate(25);
      break;
    case 'thud':
      navigator.vibrate([300]);
      break;
    case 'heartbeat':
      navigator.vibrate([50, 100, 50, 100, 50, 100, 50, 100, 50]);
      break;
    default:
      break;
  }
};

