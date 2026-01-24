/**
 * Animal Detection Utility using TensorFlow.js and COCO-SSD
 */
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

// List of animals we want to detect
const TARGET_ANIMALS = [
  'dog',
  'cat',
  'cow',
  'horse',
  'sheep',
  'elephant',
  'bear', // Adding bear and zebra just in case, though not strictly requested, they are in COCO
  'zebra',
  'giraffe',
  'bird'
];

let model = null;

/**
 * Loads the COCO-SSD model
 */
export const loadModel = async () => {
  if (model) return model;
  try {
    console.log('Loading COCO-SSD model...');
    model = await cocoSsd.load();
    console.log('COCO-SSD model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};

/**
 * Detects animals in the given image/video element
 * @param {HTMLVideoElement | HTMLImageElement | HTMLCanvasElement} element 
 * @returns {Promise<Array>} Array of detections
 */
export const detectAnimals = async (element) => {
  if (!model) {
    await loadModel();
  }

  try {
    // maxNumBoxes: 50, minScore: 0.3 (30% confidence)
    const predictions = await model.detect(element, 50, 0.3);
    
    // Log raw predictions occasionally or if array is small to avoid spam, 
    // but for debugging this issue, let's log counts at least.
    if (predictions.length > 0) {
        // console.log("Raw predictions:", predictions);
    }
    
    // Filter predictions to only include target animals
    const animalPredictions = predictions.filter(prediction => 
      TARGET_ANIMALS.includes(prediction.class.toLowerCase())
    );

    if (animalPredictions.length < predictions.length && predictions.length > 0) {
        // console.log("Filtered out some predictions. Kept:", animalPredictions);
    }

    return animalPredictions;
  } catch (error) {
    console.error('Error during detection:', error);
    return [];
  }
};
