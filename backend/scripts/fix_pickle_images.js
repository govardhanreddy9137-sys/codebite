import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY');

// Read the foods data
const foodsPath = path.join(process.cwd(), '..', 'foods_utf8.json');
let foodsData = JSON.parse(fs.readFileSync(foodsPath, 'utf8'));

// Function to generate proper image URLs using Gemini
async function generateFoodImageURL(foodName, description, category) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate a high-quality, realistic food photograph URL for: "${foodName}". 
    Description: ${description}
    Category: ${category}
    
    Please provide a direct image URL from a stock photo website (like Unsplash, Pexels, or Pixabay) that accurately represents this food item. The image should:
    1. Be high quality and appetizing
    2. Clearly show the food item
    3. Be appropriate for a food ordering app
    4. Match the description provided
    
    Return only the direct image URL, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let imageUrl = response.text().trim();
    
    // Clean up the URL if it contains extra text
    if (imageUrl.startsWith('http')) {
      // Extract just the URL if there's extra text
      const urlMatch = imageUrl.match(/https?:\/\/[^\s]+?\.(jpg|jpeg|png|webp|avif)/i);
      if (urlMatch) {
        imageUrl = urlMatch[0];
      }
    }
    
    return imageUrl;
  } catch (error) {
    console.error(`Error generating image for ${foodName}:`, error.message);
    return null;
  }
}

// Function to update pickle images
async function updatePickleImages() {
  console.log('🥒 Updating pickle images with Gemini AI...');
  
  const pickleItems = foodsData.value.filter(food => 
    food.name.toLowerCase().includes('pickle') || 
    food.description.toLowerCase().includes('pickle')
  );
  
  console.log(`Found ${pickleItems.length} pickle items to update:`);
  
  for (const food of pickleItems) {
    console.log(`\n🔄 Processing: ${food.name}`);
    console.log(`Current image: ${food.image}`);
    
    const newImageUrl = await generateFoodImageURL(food.name, food.description, food.category);
    
    if (newImageUrl) {
      food.image = newImageUrl;
      console.log(`✅ Updated image: ${newImageUrl}`);
    } else {
      console.log(`❌ Failed to generate new image for ${food.name}`);
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save the updated data
  fs.writeFileSync(foodsPath, JSON.stringify(foodsData, null, 2));
  console.log('\n✅ Successfully updated pickle images!');
}

// Function to update voting list images
async function updateVotingListImages() {
  console.log('\n🗳️ Updating voting list images...');
  
  // Update the default voting list image
  const votingListImagePath = path.join(process.cwd(), '..', 'src', 'images', 'voting_list.png');
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate a high-quality image URL for a "voting list" or "community choice" food banner. 
    The image should show:
    - Multiple food items arranged nicely
    - Voting or community theme
    - Professional food photography
    - Suitable for a "Highest Voted Items" section
    
    Return only the direct image URL from a stock photo website.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let imageUrl = response.text().trim();
    
    if (imageUrl.startsWith('http')) {
      const urlMatch = imageUrl.match(/https?:\/\/[^\s]+?\.(jpg|jpeg|png|webp|avif)/i);
      if (urlMatch) {
        imageUrl = urlMatch[0];
        console.log(`✅ Generated voting list image: ${imageUrl}`);
        
        // Update the HighestVotedItems component to use this new image
        const highestVotedPath = path.join(process.cwd(), '..', 'src', 'components', 'HighestVotedItems.jsx');
        let componentContent = fs.readFileSync(highestVotedPath, 'utf8');
        
        // Replace the default image
        componentContent = componentContent.replace(
          "src={item.image || '/src/images/voting_list.png'}",
          `src={item.image || '${imageUrl}'}`
        );
        
        fs.writeFileSync(highestVotedPath, componentContent);
        console.log('✅ Updated HighestVotedItems component with new image');
      }
    }
  } catch (error) {
    console.error('Error updating voting list image:', error.message);
  }
}

// Main execution
async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required!');
    console.log('Please set your Gemini API key:');
    console.log('export GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
  }
  
  try {
    await updatePickleImages();
    await updateVotingListImages();
    
    console.log('\n🎉 All image updates completed successfully!');
    console.log('Please restart your application to see the changes.');
    
  } catch (error) {
    console.error('❌ Error during image update:', error);
    process.exit(1);
  }
}

// Run the script
main();
