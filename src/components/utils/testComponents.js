// Test file to verify Components v2 UI components work correctly

const { 
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

// Import our new UI components
const ContainerFactory = require('./ContainerFactory');
const ButtonFactory = require('./ButtonFactory');
const SectionFactory = require('./SectionFactory');
const CommandResponse = require('../ui/CommandResponse');
const ConfigUI = require('../ui/ConfigUI');
const MusicPlayer = require('../ui/MusicPlayer');
const HelpUI = require('../ui/HelpUI');

// Test ContainerFactory
console.log('Testing ContainerFactory...');
const container = ContainerFactory.createPrimaryContainer(0x5865F2);
ContainerFactory.addHeader(container, 'Test Header', 'This is a test subtitle');
ContainerFactory.addSection(container, 'Test Section', 'This is test content');
ContainerFactory.addSeparator(container, SeparatorSpacingSize.Large, true);

const response = ContainerFactory.buildResponse(container);
console.log('ContainerFactory test passed:', response);

// Test ButtonFactory
console.log('Testing ButtonFactory...');
const primaryButton = ButtonFactory.createPrimaryButton('test_button', 'Click Me', '👍');
const secondaryButton = ButtonFactory.createSecondaryButton('test_button2', 'Secondary', 'ℹ️');
const disabledButton = ButtonFactory.createDisabledButton(ButtonStyle.Danger, 'Disabled', '❌');
console.log('ButtonFactory test passed:', { primaryButton, secondaryButton, disabledButton });

// Test SectionFactory
console.log('Testing SectionFactory...');
const infoSection = SectionFactory.createInfoSection('Info Section', 'This is info content', 'Additional details');
const actionSection = SectionFactory.createActionSection('Action Section', 'This is action content', primaryButton);
console.log('SectionFactory test passed:', { infoSection, actionSection });

// Test CommandResponse
console.log('Testing CommandResponse...');
const successResponse = CommandResponse.createSuccessResponse('Success', 'Operation completed successfully', 'Details about the success');
const errorResponse = CommandResponse.createErrorResponse('Error', 'An error occurred', 'Error details');
const infoResponse = CommandResponse.createInfoResponse('Information', 'This is informational', 'Additional info');
console.log('CommandResponse test passed:', { successResponse, errorResponse, infoResponse });

// Test ConfigUI
console.log('Testing ConfigUI...');
const configResponse = ConfigUI.create247ConfigInterface('123456789', true, { name: 'Test Voice Channel' }, { name: 'Test Text Channel' });
console.log('ConfigUI test passed:', configResponse);

// Test MusicPlayer
console.log('Testing MusicPlayer...');
const track = {
    title: 'Test Song',
    author: 'Test Artist',
    duration: '3:45',
    requester: { username: 'TestUser' },
    thumbnail: 'https://example.com/thumbnail.jpg'
};

const queue = [
    { title: 'Next Song 1', author: 'Artist 1' },
    { title: 'Next Song 2', author: 'Artist 2' }
];

const playerState = {
    paused: false,
    volume: 80,
    position: '1:30',
    repeatMode: 'off',
    shuffle: false
};

const playerResponse = MusicPlayer.createPlayerInterface(track, queue, playerState);
console.log('MusicPlayer test passed:', playerResponse);

// Test HelpUI
console.log('Testing HelpUI...');
const commandsByCategory = {
    'Music': [
        { name: 'play', description: 'Play a song' },
        { name: 'skip', description: 'Skip the current song' }
    ],
    'Config': [
        { name: 'prefix', description: 'Set the bot prefix' }
    ]
};

const helpResponse = HelpUI.createMainHelpInterface(commandsByCategory, '?');
console.log('HelpUI test passed:', helpResponse);

console.log('All component tests completed successfully!');