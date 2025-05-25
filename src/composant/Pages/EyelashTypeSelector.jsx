import React, { useState } from 'react';

const EYELASH_TYPES = [
    {
        type: 'Classique',
        desc: "Un look naturel avec un cil synthétique par cil naturel.",
        image: '/photos/classic.jpeg'
    },
    {
        type: 'Volume',
        desc: "Un style plus fourni grâce à plusieurs extensions sur un cil naturel.",
        image: '/photos/volume.jpeg'
    },
    {
        type: 'Hybride',
        desc: "Un mélange de classique et volume pour un look équilibré.",
        image: '/photos/hybrid.jpeg'
    }
];

export default function EyelashTypeSelector({ onSelect }) {
    const [hoveredType, setHoveredType] = useState(null);

    return (
        <div className="eyelashSelectWrapper">
            <h2 className="title">Choisissez votre type d'extensions de cils</h2>
            <p className="subtitle">Avant de continuer, sélectionnez le type qui vous convient</p>

            <div className="typeList">
                {EYELASH_TYPES.map(({ type, desc, image }) => (
                    <div
                        key={type}
                        onClick={() => onSelect(type)}
                        onMouseEnter={() => setHoveredType(type)}
                        onMouseLeave={() => setHoveredType(null)}
                        className={`typeCard ${hoveredType === type ? 'hovered' : ''}`}
                    >
                        <img
                            src={image}
                            alt={`${type} extensions`}
                            style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '0.8rem',
                                marginBottom: '0.8rem'
                            }}
                        />
                        <h3 style={{ marginBottom: '0.5rem', color: '#b85c9e' }}>{type}</h3>
                        <p>{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
