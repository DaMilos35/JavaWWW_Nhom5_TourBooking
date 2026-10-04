import React, { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import './SelectDropdown.css';

<<<<<<< HEAD
const SelectDropdown = ({ id, label, value, options, onChange, className = '' }) => {
=======
const SelectDropdown = ({ id, label, value, options, onChange }) => {
>>>>>>> f5336671cc11f1aebc2e9c0739f311fc33c89bde
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, isOpen]);

  const openAt = (index) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const chooseOption = (option) => {
    onChange(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openAt(selectedIndex);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openAt(selectedIndex);
    }
  };

  const handleOptionKeyDown = (event, index) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseOption(options[index]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className={`select-dropdown ${className}`.trim()} ref={rootRef}>
=======
    <div className="select-dropdown" ref={rootRef}>
>>>>>>> f5336671cc11f1aebc2e9c0739f311fc33c89bde
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className="search-input search-select-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        onClick={() => (isOpen ? setIsOpen(false) : openAt(selectedIndex))}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selectedOption?.label ?? ''}</span>
        <FaChevronDown aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          id={`${id}-options`}
          className="search-select-options"
          role="listbox"
          aria-label={label}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              ref={(element) => { optionRefs.current[index] = element; }}
              className={`search-select-option${index === selectedIndex ? ' is-selected' : ''}${index === activeIndex ? ' is-active' : ''}`}
              role="option"
              aria-selected={index === selectedIndex}
              tabIndex={0}
              onClick={() => chooseOption(option)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
