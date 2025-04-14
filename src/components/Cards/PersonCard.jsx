import React from "react";
import { imageURL2 } from "../../config/constants";

const PersonCard = ({ person, handlePersonClick }) => {
  return (
    <div 
      key={person.id} 
      className="cursor-pointer bg-zinc-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-600 transition duration-200"
      onClick={() => handlePersonClick(person)}
    >
      {/* Person profile image */}
      {person.profile_path ? (
        <img 
          src={imageURL2 + person.profile_path} 
          alt={person.name} 
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
          <img 
            src="/placeholder.jpg" 
            alt={person.name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="p-3">
        <h2 className="text-white text-lg font-bold mb-1 line-clamp-1">{person.name}</h2>
        <p className="text-white/80 text-sm">
          {person.known_for_department || "Actor/Actress"}
        </p>
        
        {/* Known for movies */}
        {person.known_for && person.known_for.length > 0 && (
          <div className="mt-2">
            <p className="text-white/60 text-xs mb-1">Known for:</p>
            <p className="text-white/80 text-sm line-clamp-2">
              {person.known_for.map(work => work.title || work.name).join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonCard; 