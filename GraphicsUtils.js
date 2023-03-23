/**
 * Draw a pie shape
 * @param {string} x - x coordinate of the center
 * @param {string} y - y coordinate of the center
 * @param {string} r - radius of the arc
 * @param {number} angle - angle of the arc
 * @param {number} size - the arc will be from angle - size to angle + size
 */
function arcAround(x, y, r, angle, size) {
    this.graphics.lineStyle(Constants.HINT_WIDTH_AFTER, Constants.ORANGE, Constants.HINT_ALPHA_AFTER);
    this.graphics.beginPath();
    let startAngle = Phaser.Math.DegToRad(180 + angle - size);
    let endAngle = Phaser.Math.DegToRad(180 + angle + size);
    this.graphics.arc(x, y, r, startAngle, endAngle, false);
    this.graphics.strokePath();
}