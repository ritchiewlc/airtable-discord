require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

// Create Express app
const app = express();
app.use(express.json());

// Create Discord client
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages
  ] 
});

// Discord bot setup
client.once('ready', () => {
  console.log(`Bot is ready as ${client.user.tag}`);
});

// API endpoint to create forum post
app.post('/create-forum-post', async (req, res) => {
  try {
    const { title, content, channelId } = req.body;
    
    // Validate API key for security
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Get channel
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Create thread in forum channel
    const thread = await channel.threads.create({
      name: title,
      message: { content: content || 'New post' },
      autoArchiveDuration: 60
    });
    
    // Return thread info for direct linking
    res.json({
      success: true,
      threadId: thread.id,
      guildId: channel.guild.id,
      channelId: channelId,
      webUrl: `https://discord.com/channels/${channel.guild.id}/${channelId}/${thread.id}`,
      appUrl: `discord://discord.com/channels/${channel.guild.id}/${channelId}/${thread.id}`
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Discord Thread Bot is running');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Login Discord bot
client.login(process.env.DISCORD_TOKEN);