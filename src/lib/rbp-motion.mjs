/** Shared RBP motion contract. Entry motion is once per viewport crossing. */
export const RBP_MOTION=Object.freeze({ease:[0.22,1,0.36,1],cssEase:'cubic-bezier(.22,1,.36,1)',duration:800,applicationDuration:550,distance:12,stagger:70,maxDelay:210,threshold:0.12,margin:'0px 0px -6% 0px'});
export const revealDelay=index=>Math.min(Math.max(0,index)*RBP_MOTION.stagger,RBP_MOTION.maxDelay);
