{/* <div>
The paragraph containing the tooltip needs to go in this section of the div.
  <wow-tooltip class="tooltip">
    <div class="tooltip__label" aria-describedby="tooltip-demo-content" data-tooltip-placeholder>
      tooltip
    </div>
    <div class="tooltip-dropdown" data-tooltip-dropdown>
      <div role="tooltip" id="tooltip-demo-content" class="tooltip-dropdown__content tooltip-body">
        It is a long established fact that a reader will be
        <strong>distracted</strong>
        by the readable content of a page when looking at its layout.
      </div>
      </div>
  </wow-tooltip>
The paragraph containing the tooltip needs to go in this section of the div.
</div> */}

class Tooltip extends HTMLElement {
  connectedCallback() {
    this.setup();
  }

  handleDropdownPosition() {
    const screenPadding = 0;

    const placeholderRect = this.placeholder.getBoundingClientRect();
    const dropdownRect = this.dropdown.getBoundingClientRect();

    const dropdownRightX = dropdownRect.x + dropdownRect.width;
    const placeholderRightX = placeholderRect.x + placeholderRect.width;

    if (dropdownRect.x < 0) {
      this.dropdown.style.left = '0';
      this.dropdown.style.right = 'auto';
      this.dropdown.style.transform = `translateX(${-placeholderRect.x + screenPadding}px)`;
    } else if (dropdownRightX > document.body.clientWidth) {
      this.dropdown.style.left = 'auto';
      this.dropdown.style.right = '0';
      this.dropdown.style.transform = `translateX(${(document.body.clientWidth - placeholderRightX) - screenPadding}px)`;
    }
  }

  toggle() {
    if (this.classList.contains('tooltip--open')) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.classList.add('tooltip--open');
    this.handleDropdownPosition();
  }

  close() {
    this.classList.remove('tooltip--open');
  }

  setup() {
    this.placeholder = this.querySelector('[data-tooltip-placeholder]');
    this.dropdown = this.querySelector('[data-tooltip-dropdown]');

    this.placeholder.addEventListener('mouseover', () => this.handleDropdownPosition());
    this.placeholder.addEventListener('touchstart', () => this.toggle());
  }
}

function dismissAllTooltips(event) {
  if (typeof event.target.closest !== 'function') return;
  const currentTooltip = event.target.closest('wow-tooltip');

  document.querySelectorAll('.tooltip--open').forEach(tooltip => {
    if (tooltip === currentTooltip) return;

    tooltip.classList.remove('tooltip--open');
  });
}

customElements.define('wow-tooltip', Tooltip);
document.addEventListener('touchstart', e =>   dismissAllTooltips(e));