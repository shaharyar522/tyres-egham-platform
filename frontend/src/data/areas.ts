import type { Area } from "@/types";

const AREA_NAMES: Array<[string, string]> = [
  ["Egham", "TW20"], ["Staines", "TW18"], ["Englefield Green", "TW20"], ["Virginia Water", "GU25"],
  ["Thorpe", "TW20"], ["Wraysbury", "TW19"], ["Old Windsor", "SL4"], ["Datchet", "SL3"],
  ["Windsor", "SL4"], ["Slough", "SL1"], ["Eton", "SL4"], ["Burnham", "SL1"],
  ["Maidenhead", "SL6"], ["Bray", "SL6"], ["Cookham", "SL6"], ["Taplow", "SL6"],
  ["Iver", "SL0"], ["Iver Heath", "SL0"], ["Stoke Poges", "SL2"], ["Farnham Royal", "SL2"],
  ["Sunningdale", "SL5"], ["Ascot", "SL5"], ["Sunninghill", "SL5"], ["Bracknell", "RG12"],
  ["Wokingham", "RG40"], ["Crowthorne", "RG45"], ["Sandhurst", "GU47"], ["Camberley", "GU15"],
  ["Frimley", "GU16"], ["Bagshot", "GU19"], ["Lightwater", "GU18"], ["Windlesham", "GU20"],
  ["Chobham", "GU24"], ["West End", "GU24"], ["Bisley", "GU24"], ["Knaphill", "GU21"],
  ["Brookwood", "GU24"], ["Pirbright", "GU24"], ["Worplesdon", "GU3"], ["Guildford", "GU1"],
  ["Woking", "GU22"], ["Byfleet", "KT14"], ["West Byfleet", "KT14"], ["New Haw", "KT15"],
  ["Addlestone", "KT15"], ["Weybridge", "KT13"], ["Walton-on-Thames", "KT12"], ["Hersham", "KT12"],
  ["Esher", "KT10"], ["Cobham", "KT11"], ["Oxshott", "KT22"], ["Stoke d'Abernon", "KT11"],
  ["Leatherhead", "KT22"], ["Ashtead", "KT21"], ["Epsom", "KT17"], ["Ewell", "KT17"],
  ["Banstead", "SM7"], ["Sutton", "SM1"], ["Cheam", "SM3"], ["Kingston upon Thames", "KT1"],
  ["Surbiton", "KT5"], ["Tolworth", "KT6"], ["Chessington", "KT9"], ["Hampton", "TW12"],
  ["Hampton Hill", "TW12"], ["Teddington", "TW11"], ["Twickenham", "TW1"], ["Whitton", "TW2"],
  ["Hounslow", "TW3"], ["Feltham", "TW13"], ["Ashford", "TW15"], ["Sunbury-on-Thames", "TW16"],
  ["Shepperton", "TW17"], ["Lower Sunbury", "TW16"], ["Laleham", "TW18"], ["Chertsey", "KT16"],
  ["Ottershaw", "KT16"], ["Lyne", "KT16"], ["Longcross", "KT16"], ["Trumps Green", "GU25"],
  ["Lalham", "TW18"], ["Charvil", "RG10"], ["Twyford", "RG10"], ["Wargrave", "RG10"],
  ["Henley-on-Thames", "RG9"], ["Marlow", "SL7"], ["Bourne End", "SL8"], ["Flackwell Heath", "HP10"],
];

export const AREAS: Area[] = AREA_NAMES.map(([name, prefix], idx) => ({
  id: idx + 1,
  name,
  postcodePrefix: prefix,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
}));

export const getAreaBySlug = (slug: string) => AREAS.find((a) => a.slug === slug);
