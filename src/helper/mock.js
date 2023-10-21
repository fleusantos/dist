const conversations = [
  {
    time: 8.443359729154308,
    msg_list: [
      {
        who: "Tom",
        msg: ' "Wok Eye is displaying outstanding Flight? talent tonight!"',
      },
      {
        who: "Travis",
        msg: ' "Unbelievably fast! At position 9 and still accelerating!"',
      },
    ],
  },
  {
    time: 12.073359729154308,
    msg_list: [
      {
        who: "Tom",
        msg: " Wok Eye's Flight? talent is an amazing sight, folks!",
      },
      {
        who: "Travis",
        msg: " Absolutely, Tom. Speed is high, and Wok Eye's in the lead!",
      },
    ],
  },
  {
    time: 23.48187605747694,
    msg_list: [
      {
        who: "Tom",
        msg: ' "Fused Chicken 486 pulls an ace, folks! Teleport active!"',
      },
      {
        who: "Travis",
        msg: ' "Unbelievable speed! It\'s shooting from the 8th position!"',
      },
    ],
  },
  {
    time: 26.30187605747694,
    msg_list: [
      {
        who: "Tom",
        msg: ' "Fused Chicken 486 is in the lead! What speed!"',
      },
      {
        who: "Travis",
        msg: ' "Mind-blowing! This teleport talent is a game changer."',
      },
    ],
  },
  {
    time: 47.233610702651504,
    msg_list: [
      {
        who: "Tom",
        msg: " Metamorphosis is rapid! Blazing with Devolution talent!",
      },
      {
        who: "Travis",
        msg: " Wow! It's soaring, sitting pretty at position 10.",
      },
    ],
  },
  {
    time: 49.7736107026515,
    msg_list: [
      {
        who: '"Tom',
        msg: " Wok Eye's not doing great, Travis. Relies on Devolution but, it’s slow.",
      },
      {
        who: "Travis",
        msg: ' Yes Tom, 10th position. Needs a speed boost ASAP!"',
      },
    ],
  },
  {
    time: 50.2736107026515,
    msg_list: [
      {
        who: "Tom",
        msg: " \"Spinning Wheel isn't rushing, Travis. It's playing safe.\"",
      },
      {
        who: "Travis",
        msg: ' "Right, Tom. Using Devolution, smart for stamina conservation!"',
      },
    ],
  },
  {
    time: 50.43361070265151,
    msg_list: [
      {
        who: "Tom",
        msg: ' "Metamorphosis with Devolution is moving lightning fast!"',
      },
      {
        who: "Travis",
        msg: ' "Impressive! Already at position 3!"',
      },
    ],
  },
  {
    time: 52.0736107026515,
    msg_list: [
      {
        who: "Tom",
        msg: ' "Wok Eye, showing phenomenal talent! Truly a swift bird."',
      },
      {
        who: "Travis",
        msg: ' "Currently at position 11, but with that speed, watch out!"',
      },
    ],
  },
  {
    time: 64.90207930265518,
    msg_list: [
      {
        who: "Tom",
        msg: " Folks, Pak seems to be struggling with CK-47's slow speed.",
      },
      {
        who: "Travis",
        msg: " Right Tom, currently stuck at eighth position, tough times!",
      },
    ],
  },
  {
    time: 64.90207930265518,
    msg_list: [
      {
        who: "Tom",
        msg: ' "Chick Fil-A, with the CK-47 talent, is slightly slow. Not ideal."',
      },
      {
        who: "Travis",
        msg: ' "Yep, position 10. Needs to capitalize on his talent, Tom!"',
      },
    ],
  },
  {
    time: 66.78207930265518,
    msg_list: [
      {
        who: "Tom",
        msg: ' "Jupiter Rex in 7th place folks, with the CK-47 talent!"',
      },
      {
        who: "Travis",
        msg: ' "He\'s showcasing blistering speed. Watch him go!"',
      },
    ],
  },
  {
    time: 70.77669082569444,
    msg_list: [
      {
        who: "Tom",
        msg: " Pak, armed with sheer talent, blazes in the 9th position.",
      },
      {
        who: "Travis",
        msg: " Remarkable speed for Pak, proving why he's on the fast track!",
      },
    ],
  },
  {
    time: 70.77669082569444,
    msg_list: [
      {
        who: "Tom",
        msg: " Chick Fil-A is showcasing remarkable talent and speed in position 12!",
      },
      {
        who: "Travis",
        msg: " Indeed Tom, her astounding velocity is a sight to behold!",
      },
    ],
  },
  {
    time: 88.53380636671521,
    msg_list: [
      {
        who: "Tom",
        msg: " Stranger's breaking out the CK-47 talent, but the speed...",
      },
      {
        who: "Travis",
        msg: " Yeah, Tom, coming in slow, currently holding third place.",
      },
    ],
  },
  {
    time: 88.53380636671521,
    msg_list: [
      {
        who: "Tom",
        msg: " Fused Chicken 570, rocking that CK-47 talent, Travis.",
      },
      {
        who: "Travis",
        msg: " Yes, Tom! Speed's slow but in position 5. Interesting.",
      },
    ],
  },
  {
    time: 94.75785892001883,
    msg_list: [
      {
        who: "Tom",
        msg: " Mysterious Stranger, speeding in 4th! Rapid talent on exhibition!",
      },
      {
        who: "Travis",
        msg: " True, Tom! His blazing quickness is a spectacle to watch!",
      },
    ],
  },
  {
    time: 94.75785892001883,
    msg_list: [
      {
        who: "Tom",
        msg: ' "Fused Chicken 570, quite talented. Clocking high speeds at 6th."',
      },
      {
        who: "Travis",
        msg: ' "Definitely fast, but will that speed help it climb?"',
      },
    ],
  },
];

const soundProfilesMock = {
  '2853': [
    { sound: 'CK-47/CK-47_Draw', loop: false, serial: true },
    { sound: 'CK-47/CK-47_FireBackward', loop: false, serial: true },
    { sound: 'CK-47/CK-47_LandBackwards', loop: false, serial: true },
    { sound: 'CK-47/CK-47_LandForward', loop: false, serial: true },
    { sound: 'CK-47/CK-47_LeapAway', loop: false, serial: true },
    { sound: 'CK-47/CK-47_LeapBack', loop: false, serial: true },
    { sound: 'CK-47/CK-47_Wince', loop: false, serial: false },
  ],
  '2913': [
    { sound: 'Coober/Coober_Accelerate', loop: true, serial: true },
    { sound: 'Coober/Coober_Call', loop: true, serial: true },
    { sound: 'Coober/Coober_Drive', loop: true, serial: true },
    { sound: 'Coober/Coober_GetIn', loop: true, serial: true },
    { sound: 'Coober/Coober_GetOut', loop: false, serial: true },
  ],
  '2914': [
    { sound: 'FanGroup/FanGroup_Fan_Autograph', loop: true, serial: true },
    { sound: 'FanGroup/FanGroup_Fan_Camera', loop: true, serial: true },
    { sound: 'FanGroup/FanGroup_Fan_Cheer', loop: true, serial: true },
    { sound: 'FanGroup/FanGroup_Fan_Kiss', loop: true, serial: true },
    { sound: 'FanGroup/FanGroup_Fan_TVCamera', loop: true, serial: true },
    { sound: 'FanGroup/FanGroup_Relief', loop: false, serial: true },
    { sound: 'FanGroup/FanGroup_Run', loop: true, serial: true },
    { sound: 'FanGroup/FanGroup_Startle', loop: false, serial: true },
  ],
  '2915': [
    { sound: 'Rollerblades/Rollerblades_Jump', loop: true, serial: true },
    { sound: 'Rollerblades/Rollerblades_Roll', loop: true, serial: true },
    { sound: 'Rollerblades/Rollerblades_Spawn', loop: true, serial: true },
    { sound: 'Rollerblades/Rollerblades_TrickAwesome', loop: true, serial: true },
    { sound: 'Rollerblades/Rollerblades_TrickGood', loop: false, serial: true },
  ],
  '2916': [
    { sound: 'Growth/Growth_Grow', loop: true, serial: true },
    { sound: 'Growth/Growth_Run', loop: true, serial: true },
    { sound: 'Growth/Growth_Shrink', loop: false, serial: true },
  ],
  '2917': [
    { sound: 'BlueEgg/BlueEgg_Impact', loop: true, serial: true },
    { sound: 'BlueEgg/BlueEgg_Impact_3', loop: true, serial: true },
    { sound: 'BlueEgg/BlueEgg_Launch', loop: false, serial: true },
  ],
  '2918': [
    { sound: 'Helicopter/Helicopter_appears', loop: false, serial: true },
    { sound: 'Helicopter/Helicopter_disappears', loop: false, serial: true },
    { sound: 'Helicopter/Helicopter_Dismount_Ladder', loop: false, serial: true },
    { sound: 'Helicopter/Helicopter_Holding_Ladder_Fired', loop: false, serial: false },
    { sound: 'Helicopter/Helicopter_Holding_Ladder_Loaded', loop: false, serial: false },
    { sound: 'Helicopter/Helicopter_Missile_Hit_1', loop: false, serial: false },
    { sound: 'Helicopter/Helicopter_Missile_Hit_3', loop: false, serial: false },
    { sound: 'Helicopter/Helicopter_Mount_Ladder', loop: false, serial: false },
    { sound: 'Helicopter/Helicopter_Shooting', loop: true, serial: false, repeat: 2 },
  ],
  '2919': [
    { sound: 'Anvil/Anvil_Get_Up', loop: false },
    { sound: 'Anvil/Anvil_Lands', loop: true },
    { sound: 'Anvil/Anvil_Throw', loop: true },
  ],
  '2920': [
    { sound: 'CK-47/CK-47_Draw', loop: false, serial: true },
    { sound: 'CK-47/CK-47_FireBackward', loop: false, serial: true },
    { sound: 'CK-47/CK-47_LandBackwards', loop: false, serial: true },
    { sound: 'CK-47/CK-47_LandForward', loop: false, serial: true },
    { sound: 'CK-47/CK-47_LeapAway', loop: false, serial: true },
    { sound: 'CK-47/CK-47_LeapBack', loop: false, serial: true },
    { sound: 'CK-47/CK-47_Wince', loop: false, serial: false },
  ],
  '2921': [
    { sound: 'Dig/Dig_Appear', loop: false, serial: true },
    { sound: 'Dig/Dig_DirtMounds', loop: false, serial: true },
    { sound: 'Dig/Dig_Dive', loop: false, serial: true },
  ],
  '2996': [
    { sound: 'Jetpack/Jetpack_FireOut', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_Fly', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_FlyRed', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_Gotfire', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_Hit', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_Landing', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_LandingRed', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_SafeLanding', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_SafeLandingRed', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_Transition', loop: false, serial: true },
    { sound: 'Jetpack/Jetpack_TransitionRed', loop: false, serial: true },
  ],
  '2923': [
    { sound: 'Teleporter/Teleporter_Button_Press', loop: false, serial: true },
    { sound: 'Teleporter/Teleporter_Dematerialising', loop: false, serial: true },
    { sound: 'Teleporter/Teleporter_Rematerialising', loop: false, serial: true },
  ],
  '2924': [
    { sound: 'ColdSnap/ColdSnap_BackRun', loop: false, serial: true },
    { sound: 'ColdSnap/ColdSnap_GotSnap', loop: false, serial: true },
    { sound: 'ColdSnap/ColdSnap_Mantra', loop: false, serial: true },
    { sound: 'ColdSnap/ColdSnap_Mantra_Outfit', loop: false, serial: true },
    { sound: 'ColdSnap/ColdSnap_Run', loop: true, serial: true },
  ],
  '2925': [
    { sound: 'BlueRooster/BlueRooster_Drink', loop: false, serial: true },
    { sound: 'BlueRooster/BlueRooster_Sprint', loop: true, serial: true },
  ],
  '2926': [
    { sound: 'Machete/Machete_Air', loop: false, serial: true },
    { sound: 'Machete/Machete_Decapitate', loop: false, serial: true },
    { sound: 'Machete/Machete_Draw', loop: false, serial: true },
    { sound: 'Machete/Machete_Fall', loop: false, serial: true },
    { sound: 'Machete/Machete_HeadlessRun', loop: false, serial: true },
    { sound: 'Machete/Machete_HeadRegrow', loop: false, serial: true },
    { sound: 'Machete/Machete_Leap', loop: false, serial: true },
    { sound: 'Machete/Machete_Slash', loop: false, serial: true },
  ],
  '2927': [
    { sound: 'Chickenapult/Chickenapult_Airtime', serial: true },
    { sound: 'Chickenapult/Chickenapult_Landing', serial: true },
    { sound: 'Chickenapult/Chickenapult_Launch', serial: true },
    { sound: 'Chickenapult/Chickenapult_Roll', serial: true },
    { sound: 'Chickenapult/Chickenapult_Spawn', serial: true }
  ],
  '2929': [
    { sound: 'Devolution/Devolution_FightCloud', loop: false, serial: true },
    { sound: 'Devolution/Devolution_Leap', loop: false, serial: true },
    { sound: 'Devolution/Devolution_Return', loop: false, serial: true },
    { sound: 'Devolution/Devolution_Roar', loop: false, serial: true },
    { sound: 'Devolution/Devolution_Run', loop: false, serial: true },
    { sound: 'Devolution/Devolution_Transform', loop: false, serial: true },
  ],
  '2930': [
    { sound: 'Flight/Flight_Flapping', loop: false, serial: true },
    { sound: 'Flight/Flight_Flapping2', loop: false, serial: true },
    { sound: 'Flight/Flight_Land_Crash', loop: false, serial: true },
    { sound: 'Flight/Flight_Land_Safe', loop: false, serial: true },
    { sound: 'Flight/Flight_Land_Safe2', loop: false, serial: true },
    { sound: 'Flight/Flight_TakeOff', loop: false, serial: true },
  ],
  '2931': [
    { sound: 'BlackHole/BlackHole_Fall', loop: false, serial: true },
    { sound: 'BlackHole/BlackHole_Spaghettification', loop: false, serial: true },
    { sound: 'BlackHole/BlackHole_SpatFly', loop: false, serial: true },
    { sound: 'BlackHole/BlackHole_SpinShrink', loop: false, serial: true },
    { sound: 'BlackHole/BlackHole_Spit', loop: false, serial: true },
  ],
  '2932': [
    { sound: 'RoyalProcession/RoyalProcession_Appear', loop: false, serial: true },
    { sound: 'RoyalProcession/RoyalProcession_Dissapear', loop: false, serial: true },
    { sound: 'RoyalProcession/RoyalProcession_Idle', loop: true, serial: true },
  ],
}